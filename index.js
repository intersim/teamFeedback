const csv = require('csv');
const fs = require('fs');

const rawData = fs.readFileSync('./data/wufoo.csv', 'utf8');

function makeFeedbackObject() {
  return {
      selfPos: null,
      selfCrit: null,
      pos: [],
      crit: []
    }
}

function writeFeedbackToFile(person, feedback) {
  const title = `# Feedback for ${person}\n\n`;

  let selfF = `## You said:\n`;

  if (feedback.selfPos) selfF += `* ${feedback.selfPos}\n`;
  if (feedback.selfCrit) selfF += `* ${feedback.selfCrit}\n`;

  let posF = `\n## Positive Feedback\n`;
  feedback.pos
  .filter(f => f)
  .forEach(f => posF += `* ${f}\n`);

  let critF = `\n## Constructive Feedback\n`;
  feedback.crit
  .filter(f => f)
  .forEach(f => critF += `* ${f}\n`);

  const feedbackStr = title + selfF + posF + critF;

  const fileName = person.split(' ').join('_');
  fs.writeFileSync(`./feedback/${fileName}.md`, feedbackStr, 'utf8');
  console.log(`Done writing feedback for ${person}`);
}

const feedback = {};

csv.parse(rawData, function(err, data){
  /*

  First slice on line 57 cuts off the header row; second slice cuts off these columns:
  * "Entry Id"
  * "Date Created"
  * "Created By"
  * "Last Updated"
  * "Updated By"
  * "IP Address"
  * "Last Page Accessed"
  * "Completion Status"

  */

  data.slice(1).map(arr => arr.slice(1, 13))
  .forEach(arr => {
    const [ name, selfPos, selfCrit, tm1, tm1Pos, tm1Crit, tm2, tm2Pos, tm2Crit, tm3, tm3Pos, tm3Crit ] = arr;
    if (!feedback[name]) feedback[name] = makeFeedbackObject();
    feedback[name].selfPos = selfPos;
    feedback[name].selfCrit = selfCrit;

    [
      {tName: tm1, pos: tm1Pos, crit: tm1Crit},
      {tName: tm2, pos: tm2Pos, crit: tm2Crit},
      {tName: tm3, pos: tm3Pos, crit: tm3Crit}
    ].forEach(teammate => {
      const { tName, pos, crit } = teammate;
      if (!feedback[tName]) feedback[tName] = makeFeedbackObject();
      feedback[tName].pos.push(pos);
      feedback[tName].crit.push(crit);
    });

  });

  if (fs.readdirSync('./').indexOf('feedback') === -1) fs.mkdirSync('./feedback');

  for (var person in feedback) {
    if (person) writeFeedbackToFile(person, feedback[person]);
  }

  console.log("Done parsing and writing feedback");
});
