.PHONY: serve

PORT=1313
HUGO_EXEC=docker run --rm -it -v ${CURDIR}:/src -p ${PORT}:1313 klakegg/hugo:ext-alpine

serve:
	 ${HUGO_EXEC} serve --verbose