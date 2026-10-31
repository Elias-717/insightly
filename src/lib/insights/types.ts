import type { Dataset, Insight } from '@/types';

/**
 * An insight rule is a pure function that inspects the dataset and returns
 * zero or more insights. Keeping each rule isolated makes it trivial to add,
 * remove, or test rules independently.
 */
export type InsightRule = (dataset: Dataset) => Insight[];
