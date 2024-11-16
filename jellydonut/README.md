## Expansion Jellydonut

A great example of the usage of `CSS Custom Properties` in a site.

### Variables we are using

- `--portion` - to evenly split the segments of the rainbow in 19 different slices without having to do a lot of math every step of the way inside the `linear-gradient` property

- `--color-rainbow-N` (with N being a number from 1 to 7) - to set the color of each segment of the rainbow

- `--image-size` - to set the image size of the Jellydonut

- `--x` and `--y` - to set the offset of the rainbow so that it kind of moves as we move the mouse

### Additional details

- Moving the mouse (or interacting via a touch screen) will update the `--x` and `--y` variables, which will in turn update the position of rainbow behind it

- Clicking on the screen will update the `--image-size` variable, which will in turn update the size of the Jellydonut