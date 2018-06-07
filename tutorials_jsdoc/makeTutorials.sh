#!/bin/sh
if [ $# -eq 0 ]
  then
      TUTORIALPATH=.
  else
	TUTORIALPATH=$1
fi
if [ $# -eq 3 ]
  then
	OUTPUTPATH=$3
  else
	OUTPUTPATH=''
fi

jsdoc -c config.json -d ../tutorials/$OUTPUTPATH $TUTORIALPATH $2 
