# Facial Expression Recognition App

A real-time facial expression detection application that identifies emotions and displays corresponding emojis and background colors.

## Features

- Real-time facial expression detection
- Dynamic emoji display based on detected emotion
- Adaptive background color themes for different emotions
- Elegant face detection boxes with minimal styling
- Loading indicators and error handling

## Emotions Detected

The application can detect the following emotions:

- Happy 😄
- Sad 😢
- Angry 😠
- Surprised 😲
- Fearful 😱
- Disgusted 🤢
- Neutral 😐

## Technologies Used

- JavaScript
- HTML/CSS
- [face-api.js](https://github.com/justadudewhohacks/face-api.js) - A JavaScript API for face detection and recognition in the browser
- Webcam integration using MediaDevices API
- TailwindCSS for styling

## Installation

1. Clone this repository
2. Make sure you have the models directory with the required AI models
3. Open the application in a browser with webcam access

## Credits

- AI Models: [face-api.js](https://github.com/justadudewhohacks/face-api.js) by Vincent Mühler
- The application uses TinyFaceDetector and FaceExpressionNet models for lightweight, efficient facial analysis

## Usage

Simply allow camera access when prompted. The application will automatically detect faces and show the corresponding emotion with an emoji and themed background color.
