const facts = [
  "I drew a lot of traditional art up until 2017. Now I focus on mixing mediums of art.",
  "I live in Toronto Canada",
  "There is a reason I go by Luck now. Ask me about it to know the full story...",
	"One time, my old memepage from 7th grade actually got me in trouble with the cops",
  "I've never been to a concert before! No reason, I just never had an artist I like show up near me.",
	"Not once have I had sushi! And its weird because It's not like i've been avoiding it or anything..",
	"My first trip by myself ever was summer 2023, where I went to New York City to visit my ex.",
	"I'm trying to get into Cybersecurity or something tech related for my career.",
	"I've been to 6 countries in my life so far",
	"Used to have a pet cat named Simba, baby orange boy, loved him so much <3",
	"I'm a cat person not a dog person. But I still love dogs, some are cute",
	"I take pictures of one/two word license plates that I see anywhere I go. I have a collection of 237 plates",
	"My birthday is June 23, 2003",
	"A lot of my preteen - teen years were spent online. I'd say its benefited me in the long run...",
	"Ive never once played CoD, Battlefield 1/2/3 etc, Halo, or any of those super popular shooter games. Adobe flash games on the family computer only!",
	"My first (and last) ever console was the Wii. Wii still have it around and everything works great.",
	"I was mutuals with the creator of Crossy Roads when I was 13, thanks to a video PewDiePie uploaded 11 years ago.",
	"For an entire 3 months, I watched nothing but Shrek related movies every single day on TV due to my 7th grade memepage that got me in trouble with police.",
	"I used my dads credit card when I was 14 to buy $308 worth of Steam games and DLC. It got me banned from Steam Markets for 5 years.",
	"My first ever username online was 'ncnv123'. I don't know why.",
	"I get a lot of things for free, from software to hardware to subscriptions. I love it.",
	"I am somewhat of a kleptomaniac. Sometimes I take things that don't belong to me and that I don't even want, just because.",
	"My first computer virus came from trying to get Clash of Clans gems for free.",
	"I reverse engineered my universities parking lot system and gave myself free parking. It still works.",
	"I'm a huge archive fan, I mass-download vids/imgs/etc. and organize them by dd/mm/yy + rename file to include context, source, and keywords.",
	"One important thing about me is that I treat changing profile pictures as a change of identity or opening a new chapter. It symbolises a new arc.",
      ];

// Shuffle the facts array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Initialize variables
let shuffledFacts = [...facts];
shuffleArray(shuffledFacts);
let currentIndex = 0;

// Function to display the next fact
function displayNextFact() {
  if (currentIndex >= shuffledFacts.length) {
    // If we've reached the end of the shuffled array, shuffle it again
    shuffleArray(shuffledFacts);
    currentIndex = 0;
  }

  const randomFact = shuffledFacts[currentIndex];
  const factDisplay = document.getElementById("factDisplay");
  factDisplay.textContent = randomFact;
  factDisplay.style.fontWeight = "bold";

  currentIndex++;
}

// Add a click event listener to the button
const generateFactButton = document.getElementById("generateFactButton");
generateFactButton.addEventListener("click", displayNextFact);

// Display the first fact when the page loads
window.addEventListener("load", displayNextFact);