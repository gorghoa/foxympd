#!/bin/bash
cd src
zip ../foxympd.zip -r -x=*~ -x=*.orig -x=.* -x=archivemoica.sh -x=scss* -x=tests/* -x=templates*  ./
cd ..
