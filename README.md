# Smart Revise: AI-Based Smart Quizzing/Revision Platform

The basic idea for this project is as follows:

#### About the quizzing platform:
- Users will have to login using the accounts provided by the institution.
- Each institution will have it's own pre-made database of Questions and Notes material available for user.
- The platform will have revision quizzes and study material divided according to subjects.
- It will also have a database of reference books as study material associated with each subject.
- Initially these reference books will be the ones recommended by the professors of that subject. But users would also be able to upload their own custom reference books and notes (typed and not in image format).

#### Quizzes generation:
- The number of questions and time can be determined by the user.
- Questions will be taken randomly at first from an internal question database. Each question will have a topic/keyword associated with it.
- After the user finishes the quiz all of the wrong responses will be recorded and will be associated with that particular user account.
- Next time the user generates a quiz, questions similar to those which were previously incorrectly answered will be added along with random questions.
- These "similar" questions can be found using Glove embeddings + KNN algorithms.

#### Study Material Suggestion algorithm:
- For generating a suggestion, the general approach would be to take the latest result of a quiz. Then we take all of the wrong questions and generate a list of topics/keywords.
- These keywords would then be searched in the database of reference books and notes associated with the subject using simple keyword search.

#### Softwares Used: 
This is a NodeJs based project with a Flask backend API. It uses MongoDB as database for both NodeJs and Flask backends. For frontend this project relies on Tailwind CSS. It will also use Tensorflow and Keras inside Flask API to build customized Quizzes and generate reading suggestions from study material. 
