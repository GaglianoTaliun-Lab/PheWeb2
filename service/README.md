# Running PheWeb 2.0 production mode as a service
You can run the PheWeb 2.0 user interface in the production mode as a service. Here we provide a quick tutorial about how you can set up the service file and run it. We will walk through the setup process on Ubuntu as an example.

## Before you run
You need to have Node.js installed first. 

To run the production mode, you need to first build the user interface (UI) by running
```
npm run build
```
After building, you may test it locally by running
```
npm run preview -- --port 8080
```
This command will launch the server at http://localhost:8080. You can test your static UI there.

## Setting the service
Once you've built the UI, you can generate a service file to run the app on your machine.
**Note: you need sudo permission to set up the service file.**
We've created an example service file called `pheweb.service` in this directory. 

Once you've set up the service file, you initiate the service by running
```
# copy your service file to the correct dir
sudo cp pheweb.service /etc/systemd/system/pheweb.service 

# reload systemd setting
sudo systemctl daemon-reload 

# auto-start the service when the machine is turned on
sudo systemctl enable pheweb.service 

# start the service
sudo systemctl start pheweb.service 
```
To check the status of your pheweb service, run
```
sudo systemctl status pheweb.service
```
To check the log, run
```
journalctl -u pheweb.service
```

**Note: you can run the PheWeb 2.0 API in a similar way by replacing the command in `ExecStart=` in the service file**