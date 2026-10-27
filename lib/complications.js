/*
 * UNEXPECTED COMPLICATIONS — one per scenario, keyed by card number.
 *
 * This file is only read by the server (/api/complication.js). It is never
 * sent to the browser until the correct passcode is entered.
 *
 *   title     short title shown above the complication
 *   text      array of paragraphs
 */
module.exports = {
  1: {
    title: "Complication 1 title",
    text: ["Complication for scenario 1 goes here."]
  },
  2: {
    title: "Complication 2 title",
    text: ["Complication for scenario 2 goes here."]
  },
  3: {
    title: "Complication 3 title",
    text: ["Complication for scenario 3 goes here."]
  },
  4: {
    title: "Complication 4 title",
    text: ["Complication for scenario 4 goes here."]
  },
  5: {
    title: "Complication 5 title",
    text: ["Complication for scenario 5 goes here."]
  },
  6: {
    title: "Complication 6 title",
    text: ["Complication for scenario 6 goes here."]
  }
};
