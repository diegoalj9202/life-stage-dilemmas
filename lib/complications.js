/*
 * UNEXPECTED COMPLICATIONS — one per scenario, keyed by card number.
 *
 * This file is only read by the server (/api/complication.js). It is never
 * sent to the browser until the correct passcode is entered.
 *
 *   text       array of paragraphs
 *   challenge  the question students answer after reading it
 *
 * The heading on the page is the scenario's title from public/js/scenarios.js.
 */
module.exports = {
  1: {
    text: [
      "Mariana discovers that her company is experiencing financial difficulties. Her manager explains that employees who participate in the new project will have greater job security. Meanwhile, Mariana's family depends on her financial support."
    ],
    challenge: "How should this new information affect your original recommendation?"
  },
  2: {
    text: [
      "Andrés learns that his current employer may reduce his working hours next month. At the same time, his parents tell him that his father needs additional support at home. Returning to Colombia would allow him to help his family, but he might lose his opportunity to establish a career in Canada."
    ],
    challenge: "Would you maintain your original advice or propose a different plan?"
  },
  3: {
    text: [
      "Valentina's partner receives a promotion that requires traveling for work twice a month. Meanwhile, her mother explains that she can only help with childcare one afternoon per week. The employer needs Valentina's final decision within three days."
    ],
    challenge: "What practical adjustments would make your recommendation possible?"
  },
  4: {
    text: [
      "Santiago's parents announce that they are planning to move to another city in four months. He can move with them and continue saving money, but he would be farther from his workplace and friends. At the same time, the apartment he likes will only be available for one more week."
    ],
    challenge: "Does this information change which option is most practical?"
  },
  5: {
    text: [
      "Claudia's employer offers her a promotion with a higher salary, but the new position requires additional working hours. Accepting it would improve her financial situation but leave less time for university. She must respond to both the employer and the university before the end of the week."
    ],
    challenge: "How could Claudia balance her long-term goals with this new opportunity?"
  },
  6: {
    text: [
      "Ricardo learns that his best friend is moving abroad permanently just two weeks after the birthday trip. This might be their last opportunity to travel together for several years. However, Ricardo has also registered for an important fitness event scheduled for the same weekend."
    ],
    challenge: "What should Ricardo prioritize, and how could he manage the consequences of his decision?"
  }
};
