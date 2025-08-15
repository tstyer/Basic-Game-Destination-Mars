# DESTINATION: MARS

## Table of Contents
 ...

## Introduction

Welcome to the README for my second portfolio project: a JavaScript-based browser game. This document outlines the whole development journey, from initial planning and design choices to implementation and final deployment. It also highlights key features, challenges encountered, and how I applied core front-end skills to bring the project to life.

## Project Overview

This project is an interactive web game built using JavaScript, HTML, and CSS. It focuses on creating an engaging user experience through responsive design, smooth gameplay, and accessible controls. The game serves as both a fun, replayable experience for users and a demonstration of my growing proficiency in front-end development, DOM manipulation, and event handling.

### Scope

The scope of this project is small, being a single-screen browser game where you guide a space bug across falling platforms. The core system are keyboard controls (← → to move, Space to jump), platform spawning and descent, landing, a distance-to-Mars meter, win/lose states, a simple “How to Play” modal, and a music on/off toggle.

## User Experience 

There is instant feedback, snappy controls, and short sessions that feel fair. The first ground touch after starting is lenient (grace) to avoid cheap game-overs.

The player sees a brief “How to Play” modal, press Space to start, watch the Mars meter tick down as they land platforms, and either win when it reaches zero or retry via the restart prompt.

Controls & feedback: arrow keys move immediately; Space jumps; sprite facing updates as you move; the Mars meter and subtle sounds reinforce progress; game-over/win modals clearly signpost the next action.

Accessibility: fully keyboard-playable, high-contrast UI elements, ARIA attributes on the modal, and a music toggle for reduced-audio play. 

### Demographics

This game is designed for casual players of all ages 12 and above who enjoy light, engaging browser-based experiences. The visual style can appeal to children and teens, and the challenge-based gameplay and aesthetics are also designed to attract older players, especially those familiar with classic arcade and platform games.

#### Target Audience

- Children aged 8–14 looking for quick, fun web games  
- Teens and young adults who enjoy competitive but straightforward gameplay  
- Adults (20s–40s) seeking casual games with nostalgic or retro appeal  
- Mobile-first users who play games on the go  
- Game developers and designers seeking inspiration or examples of interactive UI design

#### Goals

- Increase traffic and repeat visits through engaging gameplay and visual polish  
- Build a community through social sharing, player feedback, and ongoing updates  
- Offer the game as a portfolio piece demonstrating front-end development and UX skills  
- Potentially monetise through ads, sponsorships, or merchandise, depending on reach and demand

### Structure

The site is divided into clear, intuitive sections:

- **Game Screen** – Core interactive experience with responsive UI  
- **Instructions Page** – Simple, accessible guidance for how to play  
- **Settings Page** – Toggle controls music
- **Footer** – Includes social links, credits, and accessibility information  

The site utilises Bootstrap and jQuery for its layout and responsiveness, complemented by custom CSS for a unique visual identity.

### User Expectations

Users expect:

- Immediate understanding of the game’s objective  
- Clear navigation with no unnecessary friction  
- Fast load times and smooth transitions  
- Fun, replayable gameplay with feedback 
- Compatibility across devices and browsers  
- The ability to share or compete (e.g. scores or achievements)

### User Stories

Below are user stories representative of the project. 

#### Target User Goals

- Quickly begin playing without needing to register or download  
- Progress and improve over time with visible feedback  
- Access the game on mobile during short breaks or downtime  
- Feel a sense of reward, progress, or completion  
- Return later and pick up where they left off  

#### New Visitors

As a new user…  
- I want to quickly understand what the game is about so I can decide if I want to proceed to play.  
- I want to browse the instructions page and easily understand how to play the game.  
- I want simple and clear instructions, displayed well with clear fonts and contrasting colours.  
- I want visual feedback, like hover effects so I know my interactions are correctly registered.  
- I want the page to load quickly, so I don’t change my mind and exit before I see the information.   

#### Returning Visitors

As a returning user…  
- I want to easily find the social channels of the game so I can follow them.  
- I want to resume where I left off, so I can continue playing without starting again.  
- I want my settings (like difficulty or sound preferences) to be remembered, so I don’t have to reselect them each time.  
- I want to see my previous scores or progress, so I can try to beat them or track how I’ve improved.  
- I want quick access to the core parts of the game, so I don’t have to re-read instructions or click through multiple screens.  
- I want a smooth and fast-loading experience, so I don’t get frustrated and leave the site.  
- I want the design and layout to feel familiar, so I can quickly get back into the flow of playing.  
- I want the option to share feedback or report bugs, so I feel involved and heard as a regular player. 

### Site-Owner Goals

As the site owner, my goals are:

- To showcase my skills within JavaScript and Jest. 
- To deliver a simple website that gholds complex JavaScript and Jest. 
- To develop a responsive game for all browsers. 
- To use interactivity with the mouse AND keyboard. A simple game like this was the best option. 

## Features 

Below are the main features within the project. 

### Space Bug

The space bug was generated with AI at [Shutterstock](https://www.shutterstock.com/).

I ensured that this image was original. It was paid for by me, and I completed reverse image searches on google to avoid plagiarism. 

![Image of the space bug](assets\images\space_bug_animation.png)

### Navigation Bar

The navigation bar sits at the top of the page and links to Home, Instructions, and Settings. It’s built with Bootstrap, so it’s fully responsive: centred on larger screens and collapsing into a hamburger menu on mobiles. The current page is clearly underlined, and link colours transition from the light text to the gold highlight on hover for better visibility. 

### Score Counter

The score counter appears within the game UI as “Mars: 1000” and counts down towards 0 as you successfully land on platforms. Each clean landing reduces 5, giving a clear sense of progress. When the counter reaches 0, you’ve arrived at Mars and a win message is shown with your score.

### Changing Platforms

Platforms spawn at the top of the game area and drift downwards. Early on they fall a little slower. Once you’ve progressed (halfway to Mars), they speed up to keep things lively. Spawning is constrained so the horizontal gap between consecutive platforms stays within a jumpable range, and the vertical spacing is tuned so every new platform is realistically reachable. Old platforms are removed once they pass the bottom edge to keep performance smooth.

### Interactive Music

Background music can be toggled on or off. Your preference is saved locally, so if you turn the music off it will stay off next time you visit. (System volume and mute controls still apply.) The toggle is available from the Settings page for quick access.

### Settings Page

The Settings page lets you tailor the experience. You can switch the Music on or off. Preferences are remembered where appropriate, so you don’t need to set them every time.

## Design

### Colour Scheme

A deep navy background (#001D3D) with light cyan text (#CAF0F8) ensures strong contrast. Gold accents (#FFC300) highlight interactive elements (links, current nav item, headings).

#### [Colour Scheme 1](https://coolors.co/000814-001d3d-003566-ffc300-ffd60a)

![Image of first colour palette](assets\images\screenshot_of_palette1.jpeg)

#### [Colour Scheme 2](https://coolors.co/03045e-0077b6-00b4d8-90e0ef-caf0f8)

![Image of colour palette 2](assets\images\screenshot_of_palette2.jpeg)

### Typography 

Headings use Codystar for a retro sci-fi feel; body text uses Original Surfer for friendly legibility.

### Images

All images are AI generated as explained above, and they live in assets/images/. Sprites (the bug facing left/right) and the platform use PNG so their transparent edges render cleanly.


### Wireframes

The initial Wire Frame designs are listed below. However, over the course of creating the website, and due to timiing, modicfications were made and elements subtracted. 

#### Initial Website Design

- ![Screenshot of Hompage Design](assets\images\balsamiq_home_screenshot.png)
- ![Screenshot of Settings Page](assets\images\balsamiq_settings_screenshot.png)
- ![Screenshot of Instructions Page](assets\images\balsamiq_instructions_screenshot.png)

### Future Design Plans

My plans for the future are:

1. Create an animated background as the Space Bug goes higher. 
2. To add sound effects to the landing, new game, and game over effects. 
3. To add a difficulty setting. 
4. Create a score chart. 
5. Make the Bug more repsonsive and animated when it lands or moves. 
6. Improve the overall layout and appearance.
7. Develop into an app for own learning. 

## Technology Use

- Balsamiq

Used to create initial plans of the layout. The edn result was close to the original designs. 

- Shutterstock

I used a free trial to generate AI images of the space bug and the platforms. U conducted revere image searches on Google, and scanned them for copyright for free online. 

- Canva

I used Canva to edit the images once downloaded. 

- Visual Studio Code

This was thye platform to write all of my code. 

- Github

Used to host the code as it is being built, and to host the finished product. 

- Youtube

YouTube was for tutorials and learning. I foudn freeCodeCamp to offer a great example of their doodle jump game. 

- Coolors

Colours used in the website. 

- Google Fonts

The two fonts used were obtained via Google fonts. 

- jQuery (CDN)

I used the CDN version, allowing me to link to the jQuery file online. This ensured that, if any updates were made during my time using jQuery, those updates would automatically be applied. This would not have been the case had I downloaded the file, which would have allowed me to build the website offline. Had I downloaded the file, I would have pasted it into the JavaScript file within the root folder. 
  
- Jest

Regular testing of functions was carried out with Jest. This was the biggest hurdle to overcome. 

- Spotify

I used Spotify Premium to download a synthwave soundtrack to my device and store it in the assets folder. From there, I was able to play the music instantly when turning the music toggle on. The music is royalty fre from White Bat Music, produce by Karl Casey. 

- git LFS (Large File Storage)

This was installed and applied to the music file in the directory.


## Folder Structure 

├─ index.html                # Home (game) page
├─ instructions.html         # How to play
├─ settings.html             # Options (music, difficulty, etc.)
├─ assets/
│  ├─ script.js              # Game logic
│  ├─ style.css              # Site and game styling
│  ├─ images/                # Sprites, platforms, stars, favicon
│  └─ music/                 # Background music (MP3)
└─ README.md

## Deployment

This website is lightweight and static, so deployment is simple. 

### To Github Pages

The simplest way to deploy to Github:

1. Commit the site at the root, ensuring index.html is in there. 
2. Push to Github Pages. 
3. In github, go to settings, then select 'Pages'.
4. Under 'Source', choose to deploy from branch. 
5. Select Branch: Main. 
6. click Save. 

### How To Make a Clone

To clone a repository, you need to:

1. Go to the main page of the repository. 
2. Above the file, click 'Code'. 
3. Copy the URL to the repository. 
4. Under 'HTTPS', click the copy clipboard. ![Screenshot of Example](../Project_2_Star_Hopper/assets/images/screenshot_copy_github_url.webp)
5. Open Git Bash. 
6. Change the current working directory to where you want the cloned directory. 
7. Type 'git clone' and paste in the URL. 
8. Press enter to create your local clone. 

## Testing

Below is an explanation of all the testing that was conducted. 

### User Stories

As a new user…  
- I want to quickly understand what the game is about so I can decide if I want to proceed to play. 

This user goal is acheived, as on the first page, the instructions and mission are clearly presented in the transparent box. 

- I want to browse the instructions page and easily understand how to play the game.

If the user presses the 'Okay, got it.' button, but needs a refresher on the insturcitons, they can find this on the instructions page. Therefore, this is acheived. 

- I want simple and clear instructions, displayed well with clear fonts and contrasting colours.  

The instructions are clear and easy to understand. 

- I want visual feedback, like hover effects so I know my interactions are correctly registered.  

The game and website is very responsive across all platoforms. There is instant feedback when using the controls, or navigating from page to page. 

- I want the page to load quickly, so I don’t change my mind and exit before I see the information.  

The website has been tested manually and throuhg lighthouse, achieving good feedback and loading speeds. 

- I want to easily turn the music on or off. 

This is very simple to acheive. Currently it is the only settings available, and is acheived by a simple click. 

As a returning user…  
- I want to easily find the social channels of the game so I can follow them.  

These links are presented in the footer of every page, and open in a new window so as to not exit the current game page. 

- I want my settings (like difficulty or sound preferences) to be remembered, so I don’t have to reselect them each time. 

This is a future goal of mine, as of right now, the game completely resets on every page refresh. 

- I want to see my previous scores or progress, so I can try to beat them or track how I’ve improved.  

This has also not been acheived, and will be implemented on the updated version onve I learn more about Javascript and back-end development. 

- I want quick access to the core parts of the game, so I don’t have to re-read instructions or click through multiple screens.

This has been acheived, since there is no waffle and minimal clicks to get the game started. 

- I want a smooth and fast-loading experience, so I don’t get frustrated and leave the site.  

The initial load is quick and there has been no lag during the game play. 

- I want the design and layout to feel familiar, so I can quickly get back into the flow of playing.

The design and layout remains the same every time. 


### HTML Validation

HTML validation was carried out on every page. You can see the screenshots of them below. 

1. The Home Page

![Screenshot of Homepage Validation](../Project_2_Destination_Mars/assets/images/home_page_html_validated.jpeg)

2. The Settings Page

![Screenshot of settings page validation](../Project_2_Destination_Mars/assets/images/settings_page_html_validated.jpeg)

3. The Instructions Page

![Screenshot of Settings Page Validation](../Project_2_Destination_Mars/assets/images/instructions_page_html_validated.jpeg)

### CSS Validation

CSS validation:

![Screenshot of CSS validation](../Project_2_Destination_Mars/assets/images/css_validated.jpeg)

### JS Validation 

For Javascript, I used JS Lint to validate the code:

![Screenshot of Javascript Validation](../Project_2_Destination_Mars/assets/images/jslint_validation_screenshot.jpeg)

You can se there is only 1 warning to show, however, I cannot remove the '$' to get zero warnings. 

### Lighthouse 

Screenshot of the lighthouse performance analysis for the home page:

![Screenshot of Homepage](../Project_2_Destination_Mars/assets/images/lighthouse_home_page.jpg)

Settings Page:

![Screenshot of the Settings Page](../Project_2_Destination_Mars/assets/images/lighthouse_settings_page.jpg)

Instructions Page:

![Screenshot of the Instructions Page](../Project_2_Destination_Mars/assets/images/lighthouse_instructions_page.jpg)

### Manual Testing

| ID  | Area                           | Steps                                                                          | Expected Outcome                                                           | Result |
| --- | ------------------------------ | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------- | ------ |
| T01 | Landing / Modal                | Load home page.                                                                | “How to Play” modal is visible, overlayed; background is inert.            | Pass   |
| T02 | Modal – Close                  | Click **Okay, got it.**                                                        | Modal closes; focus returns to page; game not yet started.                 | Pass   |
| T03 | Modal – Keyboard Guard         | Press **Space** *before* closing modal.                                        | Game does not start; no movement; no console errors.                       | Pass   |
| T04 | Start Game                     | After closing modal, press **Space**.                                          | Game starts; platforms begin moving; controls active.                      | Pass   |
| T05 | Keyboard – Move Left/Right     | Hold **←** then **→** while standing.                                          | Bug walks instantly each tick; faces correct direction; clamped to bounds. | Pass   |
| T06 | Keyboard – Jump                | Press **Space** while standing.                                                | Bug jumps; optional mid-air steer works; lands if platform under path.     | Pass   |
| T07 | One-Time Ground Grace          | Start, step off and hit ground once.                                           | First ground touch after start is **safe**; gameplay continues.            | Pass   |
| T08 | Second Ground Touch            | Hit ground again without landing a platform.                                   | **Game Over** modal appears with score; loop stops.                        | Pass   |
| T09 | Restart Button                 | In **Game Over**, click **Restart**.                                           | Modal closes; state reset; press **Space** to start a new run.             | Pass   |
| T10 | Win Flow                       | Reduce meter to 0 via repeated landings (or test shortcut).                    | **You made it to Mars!** modal appears; score shown; loop stops.           | Pass   |
| T11 | Mars Meter Updates             | Land on a platform.                                                            | “Mars: N” decreases by **5** per valid landing.                            | Pass   |
| T12 | Speed Ramp                     | Continue until meter ≤ **500**.                                                | Platform fall speed increases to fast speed; no visual glitches.           | Pass   |
| T13 | Platform Spawn Clamping        | Observe several spawns in a row.                                               | Horizontal gaps stay within reachable range; no off-screen spawns.         | Pass   |
| T14 | Music Toggle – On              | Tick **Music** toggle.                                                         | Audio starts playing; control reflects checked state.                      | Pass   |
| T15 | Music Toggle – Off             | Untick **Music** toggle.                                                       | Audio pauses; control reflects unchecked state.                            | Pass   |
| T16 | Music Persistence              | Toggle to **On**, refresh page.                                                | Toggle remains **On**; audio resumes (subject to browser autoplay rules).  | Pass   |
| T17 | Autoplay Block Handling        | With autoplay blocked, set toggle **On**.                                      | No crash; audio may remain paused until user gesture; UI stays consistent. | Pass   |
| T18 | Links / Navigation             | Click any header/footer/internal links (e.g., Home/Settings/About if present). | Navigate to correct targets in same/new tab as designed; no 404s.          | Pass   |
| T19 | Responsive – Mobile Portrait   | 320–375 px width.                                                              | No horizontal scroll; text legible; buttons tappable; game area fits.      | Pass   |
| T20 | Responsive – Mobile Landscape  | 568–812 px width.                                                              | UI adapts; controls usable; no clipped modals.                             | Pass   |
| T21 | Responsive – Tablet            | 768–1024 px width.                                                             | Layout scales; modal centred; game area not stretched oddly.               | Pass   |
| T22 | Responsive – Desktop           | ≥ 1280 px width.                                                               | Game area centred; no excess whitespace funkiness; FPS feels stable.       | Pass   |
| T23 | Performance – Load             | Hard refresh (cache disabled).                                                 | Page interactive quickly; no long blocking scripts; no console errors.     | Pass   |
| T24 | Performance – Runtime          | Play for 3–5 minutes.                                                          | No memory creep; consistent input response; stable spawn cadence.          | Pass   |
| T25 | Accessibility – Keyboard       | Use **Tab/Shift+Tab** to reach modal button and links.                         | Visible focus states; **Enter/Space** activates buttons.                   | Pass   |
| T26 | Accessibility – ARIA           | Open/close modal and inspect `aria-hidden`.                                    | `aria-hidden` toggles correctly; overlay adds/removes `is-open`.           | Pass   |
| T27 | Accessibility – Labels         | Inspect Music toggle control.                                                  | Input is labelled; screen readers announce state changes.                  | Pass   |
| T28 | Error Handling – Missing Audio | Temporarily remove audio element and toggle.                                   | No crash; toggle hidden or safely no-ops.                                  | Pass   |
| T29 | Error Handling – No Platforms  | Start and wait without moving.                                                 | Platforms spawn over time; none appear off-screen; no exceptions.          | Pass   |
| T30 | Bounds Clamping                | Hold **→** at right edge; hold **←** at left edge.                             | Bug never moves outside game area; position clamped.                       | Pass   |

### Responsiveness 

The layout scales cleanly from small mobiles to large desktops without horizontal scrolling. Core UI elements (modal, buttons, labels) remain legible and tappable at common breakpoints, and the game area recentres to keep the player in view. Controls and status text maintain spacing so nothing overlaps when the viewport changes.

### Browser Compatibility 

Built with HTML5, CSS3 and vanilla JavaScript (plus jQuery), the site works on current versions of Chrome, Edge, Firefox and Safari, including iOS Safari and Android Chrome. Audio playback respects each browser’s autoplay policy, so sound may wait for a user interaction on first load. All buttons and modals are fully keyboard- and touch-operable; gameplay controls are keyboard-driven on desktop and work with external keyboards on mobile/tablet. 

## TDD For JavaScript

For test-driven development, I used Jest. Initially, I found this to be overwhelming and hard to grasp. I resorted to YouTube channels, such as [this one](https://www.youtube.com/watch?v=IPiUDhwnZxA), which helped. 

While testing with Jest, I also learned that you cannot test jQuery code. For this reason, all of my functions were written in vanilla JS. 

Here are the screenshots of the tests carried out:

1. I first ensured jest was installed correctly by typing npm test (before any tests written):

![Screenshot of 'npm test'](../Project_2_Destination_Mars/assets/images/screenshot_proving_jest_installed.jpeg)

2. The first test written was for the music toggle - before the toggle function was written. You can see the failure:

![Screenshot of music test](../Project_2_Destination_Mars/assets/images/music_test_fail.jpeg)

The, after writing the function, it passed:

![Screenshot of music test pass](../Project_2_Destination_Mars/assets/images/music_test_pass.jpeg)

3. The second test was for the movement of the space bug. Here's the failure:

![Screenshot of test fail](../Project_2_Destination_Mars/assets/images/screenshot_of_movement_fail.jpeg)

The pass:

![Screenshot of moveLeft pass](../Project_2_Destination_Mars/assets/images/screenshot_moveleft_pass.jpeg)

4. 



## Bugs

## Validation Errors

There were no HTML, CSS errors. The only present warning was for Javascript, as mentioned above. However, I cannot remove the dollar sign to eliminate the error. 

## Image Testing

## Credits

## Reflections 

The javascript learning hurdle has made me realise that I need to complete plenty more projects in this language to feel confident, and I plan to do that via Udemy, YouTube, and other resources. 

### What Went Well?

#### HTML and CSS

The html and CSS sections of the website were easily written with few errors. 

### Lessons Learned

#### JavaScript Logic 

Initially, looking at a blank javascript file was daunting, and the start was incredibly slow. I had to dedicate long nights to figuring things out and solving small problems. 
At times, I lost motivation and considered exiting the course due to it's difficulty. However, help from tutors and mentors allowed me to ove forward. 

#### Jest

Combining Jest into the creation, when I was brand new to Javascript only made it more difficult. The provess was incredibly slow, but I have sped up lately. 

### Future Considerations

#### Difficulty Settings

This is something I planned on implementing, but due to time and considering I had created plenty of javascript, I thought to leave it for now. My plan is to heavily modify this game and 
include this section as initially intended. 

## Conclusion 























