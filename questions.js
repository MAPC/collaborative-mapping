let currentQuestionIndex = 1;
const questionList = {
  1: ' 1. What are the important origins and destinations people will need to connect via West Station (to, from, or through)?',
  2: '2. What existing transit routes need improvements, and what new services are needed to increase the range of transit access to and from the West Station area?',
  3: '3. What active transportation routes need to be improved or created in order to provide safe access to and from the West Station area?',
  4: '4. What additional development options, zoning standards, parking requirements, transit fares, or other policies should we model and evaluate?'
}
const backButton = document.querySelector('.questions__controls--back');
const forwardButton = document.querySelector('.questions__controls--forward');
const questionText = document.querySelector('.questions__current-question');

document.querySelector('.questions__controls').addEventListener('click', (e) => {
  if (e.target.className === 'questions__controls--back') {
    currentQuestionIndex--;
  } else if (e.target.className === 'questions__controls--forward') {
    currentQuestionIndex++
  }
  if (currentQuestionIndex == 1) {
    backButton.disabled = true;
    forwardButton.disabled = false;
  } else if (currentQuestionIndex == 4) {
    backButton.disabled = false;
    forwardButton.disabled = true;
  } else {
    backButton.disabled = false;
    forwardButton.disabled = false;
  }
  questionText.innerText = questionList[`${currentQuestionIndex}`]
});
