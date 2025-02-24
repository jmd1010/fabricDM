import Item from '../Item';

/**
 * Keeps track of which Item was evaluated from a particula ItemTransformer.
 * Way to focus all items down to a smaller list of items that may or may not be classified as something.
 * Each evaluation can also contain a free form 'score' that can make it visible how close a item is to classification.
 */
export default interface EvaluationIndex {
  /**
   * Return the number of tracked evaluations.
   */
  evaluationCount(): number;

  /**
   * Returns the true if the given item has been evaluated
   * @param item
   * @returns true if the given item got evaluated
   */
  evaluated(item: Item): boolean;

  /**
   * @param item
   * @returns the score of the item in the context of the evaluation if there is any.
   * Think of it as an explanation for classification of an item.
   */
  evaluationScore(item: Item): unknown;

  /**
   * @returns true if the index tracked evaluation scores.
   */
  hasScores(): boolean;
}
