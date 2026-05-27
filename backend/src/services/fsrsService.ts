import {
  fsrs,
  generatorParameters,
  Grade,
  RecordLogItem,
  Rating,
  Card,
  State,
} from "ts-fsrs";

const f = fsrs(generatorParameters());

class FsrsService {
  preview(card: Card) {
    return f.repeat(card, new Date());
  }

  review(card: Card, rating: Grade): RecordLogItem {
    const schedulingCards = f.repeat(card, new Date());

    return schedulingCards[rating];
  }
}

export const fsrsService = new FsrsService();

export { Rating, State };
