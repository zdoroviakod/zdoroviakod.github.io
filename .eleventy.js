const fs = require('fs');
const htmlEntities = require('html-entities');
const htmlmin = require('html-minifier');
const markdownIt = require('markdown-it');

module.exports = function (eleventyConfig) {
    eleventyConfig.addWatchTarget('src/scss');

    let markdownLibrary = markdownIt({
        html: true,
        breaks: true,
        linkify: true,
    });
    eleventyConfig.setLibrary('md', markdownLibrary);

    eleventyConfig.addFilter('striphtml', (str) => {
        return htmlEntities.decode(`${str.replace(/&nbsp;/g, ' ')}`, {
            level: 'html5',
        });
    });

    eleventyConfig.addFilter('removeSpaces', (str) => {
        return str.replace(/\s/g, '');
    });

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
                minifyJS: true,
            });
            return minified;
        }

        return content;
    });

    // favicon
    eleventyConfig.addPassthroughCopy({
        'src/favicon': 'favicon',
        'src/img': 'img',
        CNAME: 'CNAME',
    });

    return {
        dir: {
            input: 'src',
            output: '_site',
            data: '_data',
        },
    };
};
