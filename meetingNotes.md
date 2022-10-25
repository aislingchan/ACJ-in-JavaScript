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

### Plan for next week:

* Write a driver to feed input into my project and run simulations of comparisons
* Write unit tests
* Set up Niall Barr's project on my own machine
