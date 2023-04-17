# Supervisor Meeting Notes

## Week 3 (6 Oct 2022)


* Jeremy suggested some materials to look at
    - Read through [Steve Draper's site on ACJ](https://www.psy.gla.ac.uk/~steve/myNewWave/apr/)
    - Read [The Method of Adaptive Comparative Judgement paper](https://www.tandfonline.com/doi/full/10.1080/0969594X.2012.665354)
    - Look through [Niall Barr's ACJ GitHub repo](https://github.com/niallb/ACJ-LTI)
* We talked about the structure of the web app
    - The web app will be composed of a (1) front end viewer, (2) calculation module, and (3) data storage.
    - Think about what database you will use - Firebase, MongoDB, or some other key value storage
* Jeremy strongly advised that I store my project documents in 3 places - USB, local machine, cloud I should regularly sync your work.
* We talked about the required functionality of the web app
    - Students could also be assessors (for peer reviewing assignments). Remember to include this functionality
    - Think about how a course convenor would set up an assignment on the web app. They need to specify acceptable file types, deadlines, etc.
* Jeremy said that the web app will run on my machine right now and it will be run on a virtual machine in the future.
* I will come up with user stories for next week
* Next meeting Thursday 13th October 3pm

### Plan for next week:

- Populate the Trello board with tasks
- Analyse the implementations I have found and try to understand them. Start with the one written by Niall Barr
- Set up the web app


## Week 4 (13 Oct 2022)

* We talked about whether implementing the Learning Tools Interoperability (LTI) standard is necessary.
    - Decided to use OAuth 2 for authorizing users for now and then use LTI later. Write in a modular way to make the switch easier.
* Jeremy suggested I keep a bibliography (as a BibTeX file). Add to it as I read more material.
* Jeremy reminded me to backup and sync my work (across USB, local machine, cloud).
* We looked at the user stories on my Trello board I wrote and the wireframes I made on Invision. They both seemed fine.
* We're not entirely sure how to test the web app. I need to think about how to test my ACJ web app against Niall Barr's.
* Next meeting 2:30pm Thursday 20 October 2022

### Plan for next week:

* Finish translating Niall Barr's ACJ algorithms
* Build web page for comparing scripts. Implement functionality for selecting one of the two scripts so we can have input into our algorithm
* Read more about ACJ. Go through The Method of ACJ paper again.
* Think about how to test the web app against Niall Barr's

## Week 5 (20 Oct 2022)

 * We discussed how to test my code against Niall Barr's.
 * Jeremy suggested writing unit tests and creating a driver that would feed input into my project and run simulations of comparisons
 * Jeremy also suggested I use an SQL database as that is what Niall Barr used. This would make testing and rewriting his code much easier.
 * Next meeting 2:30pm Thursday 27 October 2022

### Plan for next week:

* Write a driver to feed input into my project and run simulations of comparisons
* Write unit tests
* Set up Niall Barr's project on my own machine

## Week 6 (27 Oct 2022)

* We looked at the code I had written so far
* Jeremy suggested that a possible extension to the project would be to have different modes for allocating pairs of papers. For example, there could be a mode for students where the papers allocated to them are very different in quality. This would test a student's understanding of what a "good" paper is versus a "bad" one.
* Next meeting 11am Thursday 3 November 2022

### Plan for next week:

* Finish writing the driver
* Add a function which chooses the "better" paper from a pair based on some answer key
* Run simulations of my project
* Run Niall's project on my own machine and compare it's results to mine

## Week 7 (3 Nov 2022)

* We discussed the issues I was having with the SQLite module for NodeJS. The issues were mainly due to asynchronous functions not being called correctly. Jeremy directed me towards some resources on asynchronous programming.
* Jeremy also suggested I push my current code to a dev branch for him to have a look at

### Plan for next week:
* Look at resources for asynchronous programming
* Continue to work on fixing the database

## Week 8 (10 Nov 2022)
* Meeting cancelled

## Week 9 (17 Nov 2022)

* I showed Jeremy my project simulating several rounds of ACJ and logging the rankings after each round.
* Jeremy suggested I create a table to display the results of each round of ACJ.
* We talked about how the decisions are made in the simulations and Jeremy suggested I add imperfect decision making in order to get more realistic results.
* Jeremy also suggested to think about what the front end will be like

### Plan for next week:
* Create table display of results of ACJ rounds
* Add imperfect decision making
* Think about front end

## Week 10 (24 Nov 2022)

* Niall Barr was also included in this meeting.
* We looked at the table view of the submission rankings I made the previous week as well as all of the code I have written up to this point.
* We discussed what needs to be implemented next. This included a login page, submission page, admin page, and judging page.
* We decided that OpenID Client should be used to authenticate users.

### Plan for next week:
* Add mouse-over highlighting function to the table view of the rankings
* Add imperfect judging to the ACJ simulations
* Research OpenID Client

## Week 11 (1 Dec 2022)

* I demonstrated the highlighting functionality I added to the table view of rankings.
* I added imperfect judging to the system so we looked at the effect it had on the rankings table.
* We talked about the other web pages that need to be implemented and outlined the key functionality they need to provide.

### Plan for next week:
* Keep working on implementing OpenID Client
* Get started on making the rest of the pages (judging page, submission page, set up page, status page)

## Week 13 (14 Dec 2022)
* Meeting cancelled

## Week 14 (12 Jan 2023)

* I had trouble getting OpenID Client to work so we worked on debugging it together.

### Plan for next week:
* Get OpenID Client working

## Week 15 (19 Jan 2023)

* I demonstrated the log in system working.
* Jeremy suggested I work on the web app for the next two weeks and then move onto the evaluation stage. We talked about the different ways to evaluate the project - compare features with Niall Barr's project, perform a user study, performance evaluation on different numbers of assessments.
* No meeting next week.

### Plan for next two weeks:
* Finish creating all of the pages (judging page, submission page, set up page, status page)

## Week 17 (2 Feb 2023)
* Meeting cancelled

## Week 18 (8 Feb 2023)

* I demonstrated the new functionality I had added (lecturers can create an assignment, students can upload their coursework, markers are given pairs of submissions to judge, judging ends when a user-defined number of rounds of ACJ have been conducted, the final ranking is then displayed.)
* Jeremy suggested adding a few more features including code highlighting, allowing teachers to upload a CSV file of students and markers when creating an activity, letting users see the submission associated with each entry in the table ranking, and showing students a preview of the file they have submitted.
* We also talked about writing up documentation for the project including information about installation and database management etc.

### Plan for next week:
* Add the features mentioned above

## Week 19 (16 Feb 2023)

* I showed Jeremy the new features I had added (code highlighting, teachers can add students and markers to an assignment by uploading a CSV file containing the email addresses of the participants, and students can see a preview of the file they have submitted)
* We arranged a meeting with Niall Barr on 23 Feb to do a think aloud study.

### Plan for next week:
* Prepare for think aloud study with Niall Barr

## Week 20 (23 Feb 2023)

* Conducted a think aloud study with Niall Barr.
* Made an audio recording of the session.

### Plan for next week:
* Listen to the audio of the evaluation and write it up.

## Week 21 (2 Mar 2023)
* Meeting cancelled due to illness

## Week 22 (10 Mar 2023)

* Jeremy suggested I get an extension on my project due to my being ill for a week.
* We talked about the chapters of the dissertation and what kind of work should be discussed in each chapter.

### Plan for next week:
* Begin writing dissertation.

## Week 23 (16 Mar 2023)

* I showed Jeremy what I had written for the Requirements chapter of the dissertation.
* He suggested grouping the user stories by theme or phase, giving the requirements numbers or unique names (log in story, view submission story), having generic user requirements, and including non-functional requirements.
* I asked him why it was important to implement ACJ in JavaScript as opposed to PHP and he replied that it is more widely deployed, easier to refactor, and possibly more efficient.
* He mentioned including the ACJ simulations to prove that the ACJ engine worked.
* We talked about what should be incuded in the Design chapter.
* Next meeting Wed 22 March 10:30am

### Plan for next week:
* Begin writing Design chapter of dissertation and adjust the Requirements chapter.

## Week 24 (22 Mar 2023)

* We talked about my difficulties with getting any coursework done.
* We talked about submitting a good cause claim.
* Jeremy suggested talking to the student support team.
* Next meeting Fri 24 March 2:30pm

### Plan for next meeting

* Write the introduction for dissertation

## Week 24 (24 Mar 2023)

* We looked at the paragraphs I had written for the introduction.
* Jeremy suggested mentioning that ACJ was used in Glasgow Uni, including an image of Niall's ACJ project
* We talked about writing the background and what type of information should be included.

### Plan for next meeting

* Write the background for dissertation and add to introduction.

## Week 25 (29 Mar 2023)

* We talked about what kinds of papers to include in the background.
* Jeremy said to email Niall Barr to see if he knew of a paper with ACJ pseudocode
* We talked about pre-existing ACJ products to mention in the background section.

### Plan for next meeting

* Write the background for dissertation.

## Week 26 (5 Apr 2023)

* Had a meeting with Jeremy Singer and Niall Barr.
* Niall mentioned that he did not know of any ACJ papers with pseudocode, only ones with mathematical equations.
* Niall agreed to write some pseudocode describing his ACJ algorithm.
* Jeremy suggested writing bullet points for the design and implementation chapters.
* We discussed what should be included in the design chapter.
* We also talked about pre-existing ACJ products.

### Plan for next meeting

* Write the design chapter for dissertation.

## Week 27 (12 Apr 2023)

* We looked at the parts I had written so far so the design chapter.
* We talked about what to add to the background chapter and implementation chapter.

## Week 27 (14 Apr 2023)

* We had a look at the bulletpoints I had written in the design and implementation chapter.
* Jeremy suggested adding more screenshots and wireframes to the design chapter.
* We talked about how to write up the think aloud study in the evaluation chapter.
