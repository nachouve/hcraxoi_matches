# Hockey RAXOI - Seguintes partidos

This is a small mash up that collects timetables of matches of HC Raxoi teams.

Don't you know HC Raxoi??

Then visit its website and social media:

https://raxoi.com/
https://www.instagram.com/hcraxoi/


## Test it locally

python -m http.server

Try:
http://localhost/app.html


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
