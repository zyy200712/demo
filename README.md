# Gemini 2.0 Flash Multimodal Live API Client writen in vanilla JS

This project is a web application that demonstrates the capabilities of the Gemini 2.0 Flash Multimodal Live API. It allows users to interact with the API using text, audio, video, and screen sharing in real-time.
Made possible by [Google's original React based repository](https://github.com/google-gemini/multimodal-live-api-web-console).

## Inspiration

This repository was inspired by [this issue](https://github.com/google-gemini/multimodal-live-api-web-console/issues/19)

It aims to demonstrate the Gemini 2.0 Flash Multimodal Live API using a simple web client built with vanilla JavaScript, HTML, and CSS. It was created to address the complexity of the original React-based implementation found in the [Google's original React based repository](https://github.com/google-gemini/multimodal-live-api-web-console). The original implementation, while functional, introduced unnecessary dependencies and a build process that obscured the simplicity of interacting with the API. This project simplifies the development process by removing the need for React, TypeScript, SCSS, and a complex build chain, making it more accessible and easier to understand for a wider range of developers.

## Features

* **Text Input:** Send text messages to the Gemini API and receive responses.
* **Audio Input:** Use your microphone to send audio input to the API.
* **Audio Output:** Hear the API's responses through your speakers.
* **Video Input:** Send video from your webcam to the API. (It uses motion detection to aviod sending static frames for better performance)
* **Screen Sharing:** Share your screen with the API.
* **Real-time Interaction:** Experience low-latency interactions with the API made possible by optimizations.
* **Function Calling:** Utilize function calling capabilities for enhanced interactions.
* **Visual Feedback:** Audio visualizers provide real-time feedback on audio input and output levels.
* **Error Handling:** Robust error handling and logging for debugging.

## Getting Started

### Prerequisites

* A modern web browser that supports the Web Audio API, WebRTC, and WebSockets.
* A Google AI Studio API key.
* Python 3.0 or higher.

### Note

I think this is the minimal version that supports `python -m http.server`. If you can run js in other ways, you can ignore this.
Cause I got security error when I just open the index.html file in the browser. If you know better please craete a PR for this part.

### Installation

1. Clone this repository to your local machine.
2. Navigate to the project directory.
3. Create a `config.js` file inside the `js/config` directory.
4. Add your Google AI Studio API key to `config.js` following the instructions in `js/config/README.md`.
5. Run `python -m http.server` in the project root. (It runs at `localhost:8000` by default but you can just write a port after like `python -m http.server 3000` to run it at `localhost:3000`)

### Usage

1. Click the "Connect" button to establish a connection to the Gemini API.
2. Enter text messages in the input field and click "Send" to interact with the API.
3. Click the microphone button to start sending audio input.
4. Click the camera button to start sending video from your webcam.
5. Click the screen share button to share your screen.
6. Observe the logs in the logs container for real-time updates and debugging information.

## Project Structure

The project is organized into several directories:

* `js/`: Contains the JavaScript code for the application.
* `audio/`: Handles audio input, output, and processing.
* `config/`: Contains configuration file, including API keys and settings.
* `core/`: Implements core functionalities like the WebSocket client and worklet registry.
* `tools/`: Defines tools for function calling with the Gemini API. You can add your own tools here. Read more in `js/tools/README.md`
* `utils/`: Provides utility functions for logging, error handling, and data conversion.
* `video/`: Manages video input and screen sharing.
* `css/`: Contains the CSS stylesheet for the application.

## Important Notes

* Ensure that your API key is kept secure and not exposed publicly (add `config.js` to `.gitignore`).
* Refer to the `js/config/README.md` file for detailed instructions on configuring your API key.
* The application is designed for modern web browsers and may not be compatible with older browsers.

## Contributing

Contributions to this project are welcome. Please feel free to submit pull requests or open issues on the repository.

## License

This project is licensed under the MIT License.
