# Profound Sound

## Music Visualization Application

Profound Sound is a music visualization app that allows users to watch, listen, and dance along to visual representations of music. The project translates waves of sound into dynamic visual displays using Web Audio API and D3. The project is available on GitHub at [andrewlidong/ProfoundSound](https://github.com/andrewlidong/ProfoundSound).

### Technologies Used
- JavaScript ES6
- Web Audio API
- D3.js
- HTML5 Canvas
- CSS3
- Webpack

### Features
- Dynamic binary tree visualization that grows with the music
- Frequency data extraction from audio files
- Canvas-rendered dancing sun that responds to sound waves
- D3-powered SVG charts that visualize audio frequencies
- Responsive animations synchronized with music

### Development Process
Profound Sound was developed as an exploration of the intersection between audio processing and visual representation. The app currently visualizes "This Must Be The Place" by The Talking Heads, creating a unique audiovisual experience.

The core of the application uses Web Audio API to extract frequency and waveform data from the audio file. This data is then used to drive various visualizations, including a recursively rendered binary tree, a dynamic sun, and D3-powered frequency charts.

One of the most challenging aspects was synchronizing the visualizations with the audio data in real-time, requiring careful optimization to maintain smooth performance while processing both audio and visual elements simultaneously.

### Key Technical Achievements
- Implemented recursive rendering of a binary tree that grows with the music
- Created dynamic canvas animations that respond to audio frequency data
- Integrated D3.js to visualize audio frequencies as animated SVG charts
- Developed a system to extract and process real-time audio data
- Optimized performance for smooth animations during audio playback

### Technical Implementation Highlights

#### Recursive Binary Tree
The centerpiece of Profound Sound is a recursively rendered binary tree in Canvas, which begins with a single branch length and grows until the deepest branches are filled with leaves.

#### Frequency Data Extraction
The app integrates with Web Audio API to extract data from audio files, creating arrays of frequency data that drive the visualizations.

#### Dynamic Canvas Rendering
The dancing sun visualization uses canvas to render a sphere that changes size and color based on the audio frequency data.

#### D3 Integration
The app uses D3.js to create dynamic SVG charts that visualize audio frequencies, with colors that adjust based on the height of each frequency bar.

### GitHub Repository
For more details and to view the source code, visit the [Profound Sound GitHub repository](https://github.com/andrewlidong/ProfoundSound). 