############################################################
# Dockerfile to build BlockyTalky router
# Based on Ubuntu
############################################################
#

# Set the base image to Ubuntu
FROM ubuntu

# File Author / Maintainer
MAINTAINER Joe Sanford joe@cs.tufts.edu

# Add the application resources URL
RUN echo "deb http://archive.ubuntu.com/ubuntu/ raring main universe" >> /etc/apt/sources.list

# Update the sources list
RUN apt-get update

# Install basic applications
RUN apt-get install -y tar git curl nano wget

# Install Python and Basic Python Tools
RUN apt-get install -y python python-dev python-distribute python-pip

# Copy the application folder inside the container
ADD /btrouter /btrouter

# Get required files from Github
RUN wget https://raw.github.com/tufts-LPC/blockytalky/master/backend/message.py --no-check-certificate
RUN wget https://raw.github.com/tufts-LPC/blockytalky/master/backend/router.py --no-check-certificate

# Get pip to download and install requirements:
RUN pip install tornado websocket 

# Expose ports
EXPOSE 8005

# Set the default directory where CMD will execute
WORKDIR /btrouter

# Set the default command to execute    
# when creating a new container
CMD python router.py
