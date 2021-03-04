# ImageBoard

## Overview

Instagram-inspired, single-page application website where anyone can post an image of their choosing, add a title and description, and comment on images. The theme of this imageboard is beautiful doors around the world.

## Technology

- Handlebars, Vue.js, AWS S3, Node.js, Express.js & PostgreSQL

## Implemented Features

- **Previous & Next Button**
    <br>
   When the image modal is open, users can click the next and previous button to view the following or previous image, respectively. If an image is not available, the arrow feature is hidden.

- **Deleting Images and Related Comments**
    <br>
    Users can delete any image. When doing so, all comments related to the specific image will also be deleted in the database.

- **Alerting Users when new image has been uploaded**
    <br>
    In this Single Page Application, users are alerted when new images have been uploaded to the site since they arrived via a notification. Clicking the notification will render the new images without deviating from SPA functionality.


## Preview

**_Intro Page and Loading Images_**
<img src="public/intro.gif">

<br>
<br>

**_Uploading an Image_**
<img src="public/upload.gif">

<br>
<br>

**_Commenting on Images_**
<img src="public/commenting.gif">
