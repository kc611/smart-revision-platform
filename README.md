# Smart Revise: AI-Based Smart Quizzing/Revision Platform

<!-- ### Available at:  https://codex-rce.netlify.app/ -->

## Project Description:
The main objective of this project is to approach
the quiz-generation platform development with
a Smart and AI-based approach. This overall
objective is broken down as follows:

- Customized Quiz Generation: Use an AI-Based solution
to generate customized quizzes according to the user’s
previous performances.

- User Performance Feedback Generation: Give the user
a clear self assessment of their strengths and weaknesses
so they can focus on the relevant areas.

- Relevant Suggestions and Readings Generation:
Generate readings/ suggestions using the organization
provided or custom notes, so that the user can work on
improvising upon his mistakes/ incorrect questions.

## Project Inspiration:
Students preparing for a quiz or examinations tend to study by
using the strategy of read-revising repeatedly. This
however can be counter-productive over time. Quizzing
upon the syllabus on the other hand can be a very effective
solution to this problem, it provides quick and useful
feedback at the weaker sections of their syllabus and helps
them make accurate self-assessments about their study
habits.

This project aims to develop a quizzing platform to
increase the amount of quality time students spend
while revising, hence making sure that the time that
students spend is productive and at the same time
supporting the overall goal of education by helping them
retain information for a longer period of time.

## Features:
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


## Tech Stack/Technologies Used
* Node.js & Express (Backend)
* Mongodb (Database)
* TailwindCSS (Frontend Design)
* Flask (API and AI Model Calls)
* Tensorflow and Keras (Buiding AI Model)

## Setup steps:

#### Get Started
```shell
# Clone repo
git clone https://github.com/kc611/smart-revision-platform.git
```

> ## NodeJS Server


#### Run in _development_ mode

Install all package dependencies (one time operation)

```shell
npm install
```

Run the application in development mode at http://localhost:3000. Should not be used in production

```shell
npm run dev
```

#### Run in _production_ mode:

Compiles the application and starts it in production production mode.

```shell
npm run compile
npm start
```

> ## API Server

#### Run Flask API

Run the application in development mode at http://localhost:5000 using the following commands:

```shell
python api.py
```


