import {
  faDiceOne,
  faDiceTwo,
  faDiceThree,
  faDiceFour,
  faDiceFive,
  faDiceSix,
} from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

export const UPPER_SECTION_CATEGORIES = ['Aces', 'Twos', 'Threes', 'Fours', 'Fives', 'Sixes'];

export const LOWER_SECTION_CATEGORIES = [
  '3 of a Kind',
  '4 of a Kind',
  'Full House',
  'Small Straight',
  'Large Straight',
  'Yahtzee',
  'Chance',
];

export const CATEGORY_ICONS: { [key: string]: IconDefinition } = {
  Aces: faDiceOne,
  Twos: faDiceTwo,
  Threes: faDiceThree,
  Fours: faDiceFour,
  Fives: faDiceFive,
  Sixes: faDiceSix,
};

export const SCORE_DESCRIPTIONS: { [key: string]: string } = {
  Aces: 'Count and Add Only Aces',
  Twos: 'Count and Add Only Twos',
  Threes: 'Count and Add Only Threes',
  Fours: 'Count and Add Only Fours',
  Fives: 'Count and Add Only Fives',
  Sixes: 'Count and Add Only Sixes',
  '3 of a Kind': 'Add Total of All Dice',
  '4 of a Kind': 'Add Total of All Dice',
  'Full House': 'Score 25',
  'Small Straight': 'Score 30',
  'Large Straight': 'Score 40',
  Yahtzee: 'Score 50',
  Chance: 'Score Total of All 5 Dice',
  'Yahtzee Bonus': 'Score 100 Per Bonus',
};

export const FIXED_SCORE_CATEGORIES: { [key: string]: number } = {
  'Full House': 25,
  'Small Straight': 30,
  'Large Straight': 40,
  Yahtzee: 50,
};

export interface PlayerTotals {
  upperTotal: number;
  bonus: number;
  upperTotalWithBonus: number;
  lowerTotal: number;
  grandTotal: number;
}
