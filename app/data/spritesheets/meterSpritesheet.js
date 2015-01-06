module.exports = {
  "frames": [
    {
      "filename": "foreground",
      "frame": {
        "x": 0,
        "y": 0,
        "w": 694,
        "h": 68
      }
    },
    {
      "filename": "background",
      "frame": {
        "x": 0,
        "y": 68,
        "w": 694,
        "h": 68
      }
    },
    {
      "filename": "needle",
      "frame": {
        "x": 695,
        "y": 0,
        "w": 26,
        "h": 45
      }
    },
  ],
  // The left and right edges of the leftmost and rightmost yellow boxes, respectively. Used to
  // compute the clipping mask for the foreground image.
  "leftEdge": 10,
  "rightEdge": 684
};
