import {
  fsrs,
  generatorParameters,
  Grade,
  RecordLogItem,
  Rating,
  Card,
  State,
} from "ts-fsrs";
import type { FSRSParameters } from "ts-fsrs";

import { deckRepository } from "../repositories/deckRepository";

function createFSRS(overrides?: Partial<FSRSParameters>) {
  const base = generatorParameters();

  if (!overrides) {
    return fsrs(base);
  }

  return fsrs({
    ...base,
    ...overrides,
  });
}

export interface DeckFsrsParams {
  request_retention: number;
  maximum_interval: number;
  enable_fuzz: boolean;
  enable_short_term: boolean;
  learning_steps: string;
  relearning_steps: string;
}

function toFSRSParameters(deckParams: DeckFsrsParams): Partial<FSRSParameters> {
  return {
    request_retention: deckParams.request_retention,
    maximum_interval: deckParams.maximum_interval,
    enable_fuzz: deckParams.enable_fuzz,
    enable_short_term: deckParams.enable_short_term,
    learning_steps: deckParams.learning_steps.split(",") as FSRSParameters["learning_steps"],
    relearning_steps: deckParams.relearning_steps.split(",") as FSRSParameters["relearning_steps"],
  };
}

class FsrsService {
  async preview(card: Card, deckId?: number) {
    const params = deckId ? await this.getDeckParams(deckId) : undefined;
    const f = createFSRS(params);
    return f.repeat(card, new Date());
  }

  async review(card: Card, rating: Grade, deckId?: number): Promise<RecordLogItem> {
    const params = deckId ? await this.getDeckParams(deckId) : undefined;
    const f = createFSRS(params);
    const schedulingCards = f.repeat(card, new Date());
    return schedulingCards[rating];
  }

  private async getDeckParams(deckId: number): Promise<Partial<FSRSParameters> | undefined> {
    const deckParams = await deckRepository.getFsrsParams(deckId);
    if (!deckParams) return undefined;
    return toFSRSParameters(deckParams);
  }
}

export const fsrsService = new FsrsService();

export { Rating, State };
