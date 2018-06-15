######################################################
#
# Agave Microsite Web Container Image
# Tag: agaveplatform/microsite
#
# This is the image hosting the static assets comprising
# Agave ToGo Microsite. SSL is supported.
#
# https://github.com/agaveplatform/microsites
# http://microsites.togo.agaveplatform.org
#
######################################################

FROM node:9

MAINTAINER Rion Dooley <dooley@tacc.utexas.edu>

ADD . /usr/src/app

WORKDIR /usr/src/app/web

RUN yarn

EXPOSE 8080

CMD npm start

#ENV DOCUMENT_ROOT /var/www/html

# enable compression and etags for caching
#RUN sed -i 's/^#LoadModule deflate_module/LoadModule deflate_module/g' /etc/apache2/httpd.conf && \
#    sed -i 's/^#LoadModule expires_module/LoadModule expires_module/g' /etc/apache2/httpd.conf


