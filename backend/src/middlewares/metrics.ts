import { Request, Response, NextFunction } from "express";

const BUCKETS = [50, 100, 200, 500, 1000, 2000, 5000];

interface RouteMetrics {
  count: number;
  errors: number;
  totalDuration: number;
}

interface BusinessMetricsData {
  decksCreated: number;
  cardsCreated: number;
  reviewsSubmitted: number;
  importsCompleted: number;
}

class MetricsCollector {
  private routes: Map<string, RouteMetrics> = new Map();
  private routeBuckets: Map<string, Map<number, number>> = new Map();
  private business: BusinessMetricsData = {
    decksCreated: 0,
    cardsCreated: 0,
    reviewsSubmitted: 0,
    importsCompleted: 0,
  };

  record(method: string, route: string, statusCode: number, duration: number): void {
    const key = `${method}:${route}`;
    let metrics = this.routes.get(key);
    if (!metrics) {
      metrics = { count: 0, errors: 0, totalDuration: 0 };
      this.routes.set(key, metrics);
    }
    metrics.count++;
    metrics.totalDuration += duration;
    if (statusCode >= 400) {
      metrics.errors++;
    }

    let buckets = this.routeBuckets.get(key);
    if (!buckets) {
      buckets = new Map(BUCKETS.map((b) => [b, 0]));
      this.routeBuckets.set(key, buckets);
    }
    const bucketIndex = BUCKETS.findIndex((b) => duration <= b);
    const bucketKey = bucketIndex === -1 ? BUCKETS[BUCKETS.length - 1] : BUCKETS[bucketIndex];
    buckets.set(bucketKey, (buckets.get(bucketKey) || 0) + 1);
  }

  incrementBusiness(metric: keyof BusinessMetricsData): void {
    this.business[metric]++;
  }

  getBusiness(): BusinessMetricsData {
    return { ...this.business };
  }

  snapshot() {
    const totalRequests = Array.from(this.routes.values()).reduce(
      (sum, m) => sum + m.count,
      0,
    );
    const totalErrors = Array.from(this.routes.values()).reduce(
      (sum, m) => sum + m.errors,
      0,
    );

    const requestsByRoute: Record<
      string,
      {
        count: number;
        errors: number;
        avgDuration: number;
        histogram: Record<string, number>;
      }
    > = {};

    for (const [key, metrics] of this.routes.entries()) {
      const buckets = this.routeBuckets.get(key);
      const histogram: Record<string, number> = {};
      if (buckets) {
        for (const [bucket, count] of buckets.entries()) {
          histogram[`≤${bucket}ms`] = count;
        }
      }
      requestsByRoute[key] = {
        count: metrics.count,
        errors: metrics.errors,
        avgDuration: metrics.count > 0 ? metrics.totalDuration / metrics.count : 0,
        histogram,
      };
    }

    return {
      totalRequests,
      totalErrors,
      errorRate: totalRequests > 0 ? totalErrors / totalRequests : 0,
      requestsByRoute,
      business: { ...this.business },
    };
  }
}

const collector = new MetricsCollector();

function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const route = req.route?.path || req.path;
    collector.record(req.method, route, res.statusCode, duration);
  });

  next();
}

export { MetricsCollector, metricsMiddleware, collector, BUCKETS };
export type { BusinessMetricsData, RouteMetrics };
