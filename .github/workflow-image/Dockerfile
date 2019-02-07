FROM node:10
RUN mkdir workdir
COPY --chown=node . ./workdir
USER node
WORKDIR workdir
RUN ls -al
RUN ./run.sh
USER root
WORKDIR .
