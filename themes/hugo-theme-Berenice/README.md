# Berenice

## Features

This theme is built to create a media gallery, mixing pictures and videos.

It is inspired by Nico Kaiser Hugo theme gallery. https://github.com/nicokaiser/hugo-theme-gallery

But the code is interely brand new and works different in many ways.

Galleries are displayed in vertical mode, Pinterest-fashion, same as pictures themselves. You can include videoclips in galleries (they will be on loop, mute and without control). When clicking on medias, the picture or videoclip is loaded in a js window, fullscreen and you can then control and hear videos.

The js window allows browsing through the gallery, back and forth.

### Technical

The theme uses lightgallery in version 2.7.1, notably its video and zoom plugins (this is the biggest difference from Nico Kaiser's theme which inspired this one. Hugo Theme Gallery uses photoswipe, I did not managed to integrate videoclip playing in it, so I decided to build my own theme instead).

It's built using tailwind css.

The media galleries will be copied and scaled (in the public directory) using Hugo image processing abilities, but the original (in the content directory) files will remain untouched.

## Installation

Clone the git repo, and write the theme's name in the conf' file and you're good.

    cd ~/hugo/themes/
    git clone https://github.com/22decembre/Berenice.git
    
In config.toml :

    theme = "Berenice"

## Configuration

The config file is ultra basic as the theme has (at the time of writing) very little options.

Only options now are the website's title and its URL. The timeout is present here to give time to hugo to process all the pictures it might need.

    baseURL = 'https://photos.url.com'
    languageCode = 'en-us'
    title = "22Decembre's photos"
    theme = 'Berenice'

    timeout = "120s"

    [params]
        [params.author]
        name = "Your name"
        email = "your@family.name"


## Usage

The website will work recursively and each folder in your "content" can be either of two things :

- a "single page", with an index.md. This will display a photo/videoclip album.
- a "list page", with an _index.md, where folders contained in this very folder are listed.

The home page of the website is built as a list page.

### single page

A "single page" (in hugo terminology) is created when your folder contains a "index.md" file.

Here is an index.md :

    ---
    date: 2014-06-01
    title: "Snow"
    featured_image: "20150225232653-4541f043-me.jpg"
    ---

The title will be used as title (name) for the page. The "featured_image" is the name of the picture that will be displayed as link with the name in the parent album.

The pictures in the album will be arranged in pinterest-style (as a vertical listing), with the videos towards the bottom of the album. The videoclips will be played as loop, muted, without control.

When someone clicks on a media, it shall be displayed in a lightgallery/js page, with option for controls.


### list page

A "list page" (in hugo terminology) is created when your folder contains a "_index.md" file.

Here is an _index.md :

    ---
    date: 2012-01-23
    title: "Animals"
    featured_image: "20130818104308-3df866c3-me.jpg"
    ---

It takes the same principles as the "single page", eg a title and a picture to be used as link in the parent folder.

Albums will be displayed with their names and titles in pinterest style.

You should not have both an index.md and an _index.md file in a folder. An album cannot have pictures and present links to children albums.

You should not use a videoclip as a *featured_image*.





























