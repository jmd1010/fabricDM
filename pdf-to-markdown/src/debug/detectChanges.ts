import ChangeTracker from './ChangeTracker';
import Item from '../Item';
import { groupByPage } from '../support/groupingUtils';
import { arraysEqual } from '../support/functional';

/**
 * Compares incomming and outgoing items of a transformer in order to detect changes and to display them in any debug visualization.
 * Note: ItemMerger registers changes as well.
 */
export function detectChanges(tracker: ChangeTracker, inputItems: Item[], outputItems: Item[]): Item[] {
  const oututItemsByPage = groupByPage(outputItems).reduce((map: Map<number, Item[]>, pageItems) => {
    map.set(pageItems[0].page, pageItems);
    return map;
  }, new Map());

  const mergedItems: Item[] = [];
  groupByPage(inputItems).forEach((inputPageItems) => {
    const page = inputPageItems[0].page;
    const outputPageItems = oututItemsByPage.get(page) || [];
    mergedItems.push(...detectPageChanges(tracker, inputPageItems, outputPageItems));
  });

  return mergedItems;
}

function detectPageChanges(tracker: ChangeTracker, inputItems: Item[], outputItems: Item[]): Item[] {
  const mergedItems: Item[] = [];
  const addedItems: Set<string> = new Set();
  let removals = 0;
  let additions = 0;
  let outputIndex = 0;
  for (let inputIdx = 0; inputIdx < inputItems.length; inputIdx++) {
    const inputItem = inputItems[inputIdx];

    // In case the input item has already been added from the outputs items array
    if (addedItems.has(inputItem.uuid)) {
      continue;
    }

    const positionInOutput = outputItems.findIndex((item) => item.uuid === inputItem.uuid);
    if (positionInOutput < 0) {
      // Input doesn't exist in the output anymore
      tracker.trackRemoval(inputItem);
      mergedItems.push(inputItem);
      addedItems.add(inputItem.uuid);
      removals++;
    } else if (positionInOutput === inputIdx + additions - removals) {
      // Input is in output with no positional change
      mergedItems.push(outputItems[positionInOutput]);
      addedItems.add(outputItems[positionInOutput].uuid);
      outputIndex++;
      // But with type change (TODO generalize ?)
      const typesInInput = inputItem.data['types'];
      const typesInOutput = outputItems[positionInOutput].data['types'];
      if ((typesInInput || typesInOutput) && !arraysEqual(typesInInput, typesInOutput)) {
        tracker.trackContentChange(inputItem);
      }
      if (!arraysEqual(inputItem.tokenTypes, outputItems[positionInOutput].tokenTypes)) {
        tracker.trackContentChange(inputItem);
      }
    } else {
      // Handle items from the output with arn't in the input array
      for (let intermediateOutputIdx = outputIndex; intermediateOutputIdx < positionInOutput; intermediateOutputIdx++) {
        const outputItem = outputItems[intermediateOutputIdx];
        const positionInInput = inputItems.findIndex((item) => item.uuid === outputItem.uuid);
        if (positionInInput < 0) {
          tracker.trackAddition(outputItem);
          mergedItems.push(outputItem);
          addedItems.add(outputItem.uuid);
          additions++;
          outputIndex++;
        } else {
          tracker.trackPositionalChange(outputItem, positionInInput - removals, intermediateOutputIdx - additions);
          mergedItems.push(outputItem);
          addedItems.add(outputItem.uuid);
          outputIndex++;
        }
      }
      tracker.trackPositionalChange(outputItems[positionInOutput], inputIdx - removals, positionInOutput - additions);
      mergedItems.push(outputItems[positionInOutput]);
      addedItems.add(outputItems[positionInOutput].uuid);
      outputIndex++;
      //TODO check for content change ?
    }
  }
  for (let remaingOutputIndex = outputIndex; remaingOutputIndex < outputItems.length; remaingOutputIndex++) {
    tracker.trackAddition(outputItems[remaingOutputIndex]);
    mergedItems.push(outputItems[remaingOutputIndex]);
    additions++;
  }
  return mergedItems;
}
