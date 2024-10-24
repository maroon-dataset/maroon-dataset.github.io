# Running the website
To ensure security, browsers display only the static content of the `index.html`.
To enable dynamic JavaScript content, the website has to be displayed using a local live Server.

Live servers are supported by many program language packages, as well as in many editors in form of an extension. We have tested the website with different live server variants, of which we provide documentation below.

## Python
The easiest way to set up the live server is to start python in the root directory (where `index.html` is located) of this project with:
```
python -m http.server
```
After that, the website should be accessible at `http://0.0.0.0:8000/` or `http://127.0.0.1:8000/`

## Visual Studio Code
Make sure you have downloaded and installed [Visual Studio Code](https://code.visualstudio.com/download).
Then, open this directory.

Install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension for VSCode. Clicking on the "Go Live" button in the bottom right corner of VSCode will start a local server and open a new browser tab. As long as the `index.html` file is located in the root directory of the opened project folder, the website should be directly accessible via `http://127.0.0.1:5500/`

## PHP
First, check if PHP is already installed by typing the following commands in a shell:
```
php
```
Then, run the following command in the root directory (where `index.html` is located) of this project:
```
php -S localhost:8000
```
After that, the website should be accessible at `http://0.0.0.0:8000/` or `http://127.0.0.1:8000/`

