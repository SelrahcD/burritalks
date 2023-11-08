.PHONY: serve

PORT=1313
HUGO_EXEC=docker run --rm -it -v ${CURDIR}:/src -p ${PORT}:1313 klakegg/hugo:0.101.0

serve:
	 ${HUGO_EXEC} server --verbose

install:
	npm install