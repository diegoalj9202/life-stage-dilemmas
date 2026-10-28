/*
 * SCENARIOS — the six mystery-card stories shown to students.
 *
 * Each scenario has:
 *   id        card number (1–6, keep as is)
 *   title     short title shown when the card is opened
 *   theme     small label above the title (person and topic)
 *   grammar   target forms highlighted by "Highlight grammar" (exact text from the story);
 *             type: "used" (used to), "would" (past habit), "be" (be used to), "get" (get used to)
 *   narrative array of paragraphs
 *
 * The UNEXPECTED COMPLICATIONS are NOT in this file. They live on the server
 * in /lib/complications.js so students can't read them in the page source.
 */
window.SCENARIOS = [
  {
    id: 1,
    title: "The Family Business or a Personal Dream?",
    theme: "Daniel, 32 · Family Expectations, Career Decisions, and Independence",
    grammar: [
      { text: "used to help his parents", type: "used" },
      { text: "would prepare traditional Colombian dishes", type: "would" },
      { text: "is used to working long hours", type: "be" }
    ],
    narrative: [
      "Daniel is 32 years old and lives in Medellín. For the past eight years, he has worked in his family's restaurant. When he was younger, he used to help his parents on weekends, and they would prepare traditional Colombian dishes together. Over time, he became responsible for managing the restaurant's employees and finances.",
      "Daniel is used to working long hours, dealing with customers, and making important decisions. His parents are proud of him because they believe he will eventually take over the family business.",
      "However, Daniel has always been interested in photography. Two years ago, he started taking photography courses in his free time. Recently, a travel company offered him a position as a photographer. The job would allow him to visit different places in Colombia and develop his creative skills.",
      "Unfortunately, the position offers a lower salary than his current job, and Daniel would have to travel frequently. His parents are disappointed because they were expecting him to continue managing the restaurant.",
      "Daniel feels grateful for everything his family has done for him, but he also wants to build his own professional identity. He must decide whether to continue working in the family business or take a risk and follow his personal dream."
    ]
  },
  {
    id: 2,
    title: "Starting Over in Another Country",
    theme: "Andrés, 34 · Migration and Independence",
    grammar: [
      { text: "used to have lunch", type: "used" },
      { text: "would meet his childhood friends", type: "would" },
      { text: "isn't used to the cold weather", type: "be" }
    ],
    narrative: [
      "Andrés is 34 years old and recently moved from Colombia to Canada. Before moving, he lived close to his parents and worked as an engineer. He used to have lunch with his family every Sunday, and he would meet his childhood friends after work. He was comfortable with his daily routine and rarely worried about feeling lonely.",
      "Six months ago, Andrés decided to move abroad because he wanted better professional opportunities and a different lifestyle. However, adapting to his new environment has been more difficult than he expected.",
      "He isn't used to the cold weather, and he finds it difficult to communicate confidently in English. Although he has found a job, it is not related to engineering. His current salary covers his basic expenses, but he cannot save much money.",
      "Andrés spends most weekends alone because he hasn't made many friends. He misses the spontaneous social gatherings he enjoyed in Colombia. His family encourages him to return home, but he believes leaving Canada now would mean abandoning an important personal goal.",
      "Recently, he received an invitation to join a professional training program. It could help him return to engineering, but it requires a significant financial investment and several months of study.",
      "Andrés must decide whether to continue adapting to his new life or reconsider his plans."
    ]
  },
  {
    id: 3,
    title: "When Family Changes Everything",
    theme: "Valentina, 31 · Parenthood and Personal Identity",
    grammar: [
      { text: "used to attend dance classes", type: "used" },
      { text: "would travel", type: "would" },
      { text: "was used to organizing", type: "be" },
      { text: "isn't used to having", type: "be" }
    ],
    narrative: [
      "Valentina is 31 years old and became a mother eight months ago. Before having her baby, she worked as a graphic designer and enjoyed an active social life. She used to attend dance classes twice a week, and she would travel with her partner whenever they had a long weekend.",
      "Valentina loved her independence. She was used to organizing her own schedule and making spontaneous plans with friends. However, her priorities changed significantly after her daughter was born.",
      "Nowadays, she spends most of her time caring for her baby. She loves being a mother, but she sometimes misses her previous routine. She isn't used to having so little personal time, and she often feels tired because her daughter wakes up several times during the night.",
      "Her partner works full-time and helps with childcare in the evenings. Recently, Valentina's former employer contacted her and offered her a part-time position working remotely. She is excited about the opportunity because she misses her professional life.",
      "However, she worries about managing work and childcare at the same time. Her mother has offered to help, but Valentina doesn't want to depend on her family too much.",
      "She wants to develop her career without losing important moments with her daughter. She also wonders whether returning to work will help her feel more like herself again."
    ]
  },
  {
    id: 4,
    title: "Freedom or Financial Stability?",
    theme: "Santiago, 25 · Independence and Financial Priorities",
    grammar: [
      { text: "used to spend", type: "used" },
      { text: "is now used to following", type: "be" }
    ],
    narrative: [
      "Santiago is 25 years old and has been working as a software developer for two years. He currently lives with his parents in Medellín. During university, he used to spend most of his money on entertainment, clothes, and weekend trips. He rarely thought about saving because his parents covered many of his expenses.",
      "Since starting his professional career, Santiago has become more responsible with money. He is now used to following a monthly budget, and he saves part of his salary regularly.",
      "However, he feels that living with his parents limits his independence. He would like to invite friends over, organize his own routine, and make decisions without explaining everything to his family.",
      "Recently, Santiago found a small apartment near his workplace. Moving there would reduce his daily commute and give him greater freedom. Unfortunately, the rent and other expenses would consume almost half of his monthly income.",
      "His parents have suggested that he stay home for another two years so he can save enough money to buy an apartment. His friends believe he should move out because becoming independent is an important part of adulthood.",
      "Santiago has enough savings to cover the initial moving expenses, but he worries about unexpected costs. He must decide whether personal freedom is more important than financial security at this stage of his life."
    ]
  },
  {
    id: 5,
    title: "Too Old to Start Again?",
    theme: "Claudia, 48 · Education and Changing Expectations",
    grammar: [
      { text: "used to dream", type: "used" },
      { text: "would leave home early", type: "would" },
      { text: "was used to putting", type: "be" },
      { text: "isn't used to digital learning platforms", type: "be" }
    ],
    narrative: [
      "Claudia is 48 years old and has worked as an administrative assistant for more than twenty years. When she was younger, she used to dream about studying psychology, but her family needed financial support, so she started working immediately after finishing school.",
      "For many years, Claudia followed a predictable routine. She would leave home early, spend the day at the office, and return home to take care of her children. She was used to putting her family's needs before her personal ambitions.",
      "Now that her children are adults, Claudia has more free time. She recently discovered an online university program in psychology and became excited about the possibility of studying again.",
      "However, she hasn't attended formal classes in decades. She isn't used to digital learning platforms, academic assignments, or studying for examinations. She also worries that younger students might learn faster than she does.",
      "Her husband supports her decision, but some relatives believe that starting a university degree at 48 is unnecessary. They suggest that she should focus on enjoying her free time instead.",
      "Claudia has enough money to pay for the first year, but completing the program would require several years of commitment. She wants to follow her dream, yet she is afraid of investing time and money in something she might not finish."
    ]
  },
  {
    id: 6,
    title: "A Healthy Life, but at What Cost?",
    theme: "Ricardo, 38 · Health, Friendships, and Lifestyle Changes",
    grammar: [
      { text: "used to eat fast food", type: "used" },
      { text: "would stay out late", type: "would" },
      { text: "is used to following", type: "be" }
    ],
    narrative: [
      "Ricardo is 38 years old and works in marketing. A year ago, he decided to change his lifestyle after noticing that he was constantly tired and had little energy.",
      "Before making these changes, Ricardo used to eat fast food several times a week, and he would stay out late with friends on Fridays and Saturdays. He rarely exercised because he believed his work schedule was too demanding.",
      "Now his life is very different. He wakes up at five every morning to exercise, prepares most of his meals at home, and goes to bed before ten. He is used to following a strict routine, and he feels healthier and more energetic than before.",
      "However, his new habits have affected his social relationships. His friends complain that he never accepts invitations to restaurants or weekend activities. Ricardo sometimes feels guilty, but he worries that changing his routine will make him return to his old habits.",
      "Recently, his best friend invited him on a four-day trip to celebrate an important birthday. The trip includes late-night activities, restaurant meals, and a schedule very different from Ricardo's usual routine.",
      "His friends believe he has become too inflexible, while Ricardo thinks they don't understand how important his new lifestyle is to him.",
      "He wants to maintain his friendships without abandoning the habits that have improved his well-being."
    ]
  }
];
