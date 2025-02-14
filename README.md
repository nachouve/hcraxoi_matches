# Hockey RAXOI - Seguintes partidos

This is a small mash-up that collects timetables of matches for HC Raxoi teams.

Don't you know HC Raxoi??

Then visit its website and social media:

- [HC Raxoi Website](https://raxoi.com/)
- [HC Raxoi Instagram](https://www.instagram.com/hcraxoi/)

## Working Version

You can view a working version of the project [here](https://bit.ly/HCRaxoi).

## Test it Locally

To test the project locally, you can use Python's built-in HTTP server:

1. **Start the server**:
   ```bash
   python -m http.server
   ```

2. **Access the application**:
   Open your browser and go to `http://localhost:8000/app.html`

## Docker Instructions

To build and run the Docker container:

1. **Build the Docker image**:
   ```bash
   docker build -t hockey-raxoi .
   ```

2. **Run the Docker container**:
   ```bash
   docker run -p 8080:80 hockey-raxoi
   ```

3. **Access the application**:
   Open your browser and go to `http://localhost:8080`
