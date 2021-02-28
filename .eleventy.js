const fs = require('fs');
const htmlmin = require('html-minifier');
const markdownIt = require('markdown-it');
const markdownLib = markdownIt({ html: true, typographer: true });
const md = new markdownIt();

module.exports = function (eleventyConfig) {
    eleventyConfig.addWatchTarget('src/scss');

    let markdownLibrary = markdownIt({
        html: true,
        breaks: true,
        linkify: true,
    });
    eleventyConfig.setLibrary('md', markdownLibrary);

    // Make 404 page work with `eleventy --serve`
    eleventyConfig.setBrowserSyncConfig({
        callbacks: {
            ready: function (err, browserSync) {
                const content_404 = fs.readFileSync('_site/404.html');

                browserSync.addMiddleware('*', (req, res) => {
                    // Provides the 404 content without redirect.
                    res.write(content_404);
                    res.end();
                });
            },
        },
    });

    // compress html
    eleventyConfig.addTransform('htmlmin', function (content, outputPath) {
        // Eleventy 1.0+: use this.inputPath and this.outputPath instead
        if (outputPath.endsWith('.html')) {
            let minified = htmlmin.minify(content, {
                useShortDoctype: true,
                removeComments: true,
                collapseWhitespace: true,
            });
            return minified;
        }

        return content;
    });

    // favicon
    eleventyConfig.addPassthroughCopy({
        'src/favicon': 'favicon',
        'src/img': 'img',
    });

    return {
        dir: {
            input: 'src',
            output: '_site',
            data: '_data'
        },
    };
};
