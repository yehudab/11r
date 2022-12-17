const Image = require('@11ty/eleventy-img');
const cheerio = require('cheerio');
const path = require("path");

function filenameFormat(id, src, width, format, options) {
    const extension = path.extname(src);
    const name = path.basename(src, extension);
    const dir = path.dirname(src);
    const yearAndMonthMatches = dir.match(/\/([0-9]{4})\/([0-9]{2})/);
    var yearMonthPrefix = '';
    if (yearAndMonthMatches) {
        yearMonthPrefix = `${yearAndMonthMatches[1]}-${yearAndMonthMatches[2]}-`;
    }
    return `${yearMonthPrefix}${name}-${width}w.${format}`;
}

let options =  {
    widths: [720, null],
    formats: ["avif", "jpeg"],
    outputDir: "./dist/img/",
    whitespaceMode: "inline",
    filenameFormat: filenameFormat
};

async function imageShortcode(src, alt, sizes = '100vw') {
  let metadata = await Image(src, options);

  let imageAttributes = {
    alt,
    sizes,
    loading: "lazy",
    decoding: "async",
  };

  return Image.generateHTML(metadata, imageAttributes);
}

function imageShortcodeSync(src, alt, sizes = '100vw') {
    // generate images, while this is async we don’t wait
    Image(src, options);

    let imageAttributes = {
        alt,
        sizes,
        loading: "lazy",
        decoding: "async",
    };

    // get metadata even the images are not fully generated
    let metadata = Image.statsSync(src, options);
    return Image.generateHTML(metadata, imageAttributes);
}


function compile() {
    return async function render(data) {
        const html = await this.defaultRenderer(data);
        const $ = cheerio.load(html);
        
        if ($('img').length > 0) {
            await Promise.all(
                // loop over all the images in our document
                $('img').toArray().map(async (img) => {
                // grab the image attributes
                let { src = '', alt = '', sizes = '100vw' } = img.attribs;
                // patch source so that it can be reached
                if (src.indexOf('/img') == 0) {
                    src = '.' + src;
                }
                // convert to an optimized image
                const optimizedImage = await imageShortcode(src, alt, sizes);
                // replace our images with an optimized one
                $(img).replaceWith(optimizedImage);
                })
            )
            return $('body').html();
        } else {
            return html;
        }

    }
}  

module.exports = {
    imageShortcodeSync: imageShortcodeSync,
    compile: compile
};