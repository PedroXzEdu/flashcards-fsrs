import { fsrs, generatorParameters, Rating, Card, State } from "ts-fsrs";

const f = fsrs(generatorParameters());

class FsrsService {
  preview(card: Card) {
    return f.repeat(card, new Date());
  }

  review(card: Card, rating: Rating) {
    const schedulingCards = f.repeat(card, new Date());

    return schedulingCards[rating as keyof typeof schedulingCards] as any;
  }
}

export const fsrsService = new FsrsService();

export { Rating, State };
