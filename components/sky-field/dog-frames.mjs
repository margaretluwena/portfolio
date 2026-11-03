/*
  The dog, frame by frame (2026-11-03). Every frame is 24 cells wide and 8
  tall, drawn facing RIGHT and mirrored to face left; '@' is fill, the
  eye and mouth are gaps. Each frame carries `eyes`, the cells that get a
  real eye drawn over them, as [col, row] facing right; `closed` draws them
  shut, `front` makes the pupils look straight out.

    run    stretched, mid-stride, tucked (the stride cycles 0 2 1 2)
    sit    two frames, the ear flap settling
    lie    down with the head up, then the chin on the paws
    spin   a turn on the spot, read through five views: side, three-
           quarter away, the back, three-quarter toward, the front; the
           sequence in sky-field.js walks side -> away -> back -> away
           (mirrored) -> side (mirrored) -> toward (mirrored) -> front ->
           toward -> side
    bow    the play bow: front down, rear up, tail high
    stand  the sit frame with the rear legs under it, between tricks

  The sheet at scripts/capture/dog/frames.html renders every frame; run
  `npm run capture:dog` to redraw public/images/about/dog-frames.png.
*/
const F = (rows, eyes = [[20, 2]], opts = {}) => Object.assign(rows, { eyes, ...opts });

export const DOGW = 24, DOGH = 8;

export const DOG = {
  run: [
    F(["                 @@@@@  ",
       "   @@          @@@@@@@@ ",
       "    @@        @@@@@@@@@@",
       "     @@@@@@@@@@@@@ @@@@ ",
       "      @@@@@@@@@@@@@@    ",
       "      @@@@@@@@@@@@@@    ",
       "      @@@      @@@@     ",
       "     @@@@      @@@@     "]),
    F(["                 @@@@@  ",
       "   @@          @@@@@@@@ ",
       "    @@        @@@@@@@@@@",
       "     @@@@@@@@@@@@@ @@@@ ",
       "      @@@@@@@@@@@@@@    ",
       "      @@@@@@@@@@@@@@    ",
       "     @@@        @@@@    ",
       "   @@@@          @@@@   "]),
    F(["                 @@@@@  ",
       "   @@          @@@@@@@@ ",
       "    @@        @@@@@@@@@@",
       "     @@@@@@@@@@@@@ @@@@ ",
       "      @@@@@@@@@@@@@@    ",
       "      @@@@@@@@@@@@@@    ",
       "      @@@       @@@@    ",
       "     @@@@       @@@@    "]),
  ],
  sit: [
    F(["                 @@@@@  ",
       "   @@          @@@@@@@@ ",
       "    @@        @@@@@@@@@@",
       "     @@@@@@@@@@@@@ @@@@ ",
       "      @@@@@@@@@@@@@@    ",
       "      @@@@@@@@@@@@@@    ",
       "     @@@@@     @@@@     ",
       "    @@@@@@@    @@@@     "]),
    F(["                 @@@@@  ",
       "  @@           @@@@@@@@ ",
       "   @@         @@@@@@@@@@",
       "     @@@@@@@@@@@@@ @@@@ ",
       "      @@@@@@@@@@@@@@    ",
       "      @@@@@@@@@@@@@@    ",
       "     @@@@@     @@@@     ",
       "    @@@@@@@    @@@@     "]),
  ],
  /* lying down: long and low, the tail out behind, the head up and then resting */
  lie: [
    F(["                  @@@@@ ",
       "                 @@@@@@@",
       "                 @@@@@@@",
       "      @@@@@@@@@@@@@@@@@ ",
       "     @@@@@@@@@@@@@@@@@@ ",
       "  @@@@@@@@@@@@@@@@@@@@  ",
       " @@ @@@@@@@@@@@@@@@@@@  ",
       "     @@@@@@@@@@  @@@@   "], [[20, 2]]),
    F(["                        ",
       "                        ",
       "                        ",
       "                   @@@@ ",
       "      @@@@@@@@@@@@@@@@@@",
       "  @@@@@@@@@@@@@@@@@@@@@@",
       " @@ @@@@@@@@@@@@@@@@@@@@",
       "     @@@@@@@@@@  @@@@@@ "], [[21, 4]], { closed: true }),
  ],
  /* the turn, as views */
  view: {
    /* three-quarter, facing away: the body foreshortens, the head turns from us */
    away: F(["               @@@@     ",
             "    @@        @@@@@@    ",
             "     @@      @@@@@@@    ",
             "      @@@@@@@@@@@@@     ",
             "       @@@@@@@@@@@      ",
             "       @@@@@@@@@@@      ",
             "       @@@    @@@       ",
             "       @@@    @@@       "], []),
    /* straight from behind: narrow, the tail up the middle */
    back: F(["           @@@          ",
             "          @@@@@         ",
             "        @@@@@@@@@       ",
             "        @@@@@@@@@       ",
             "        @@@@@@@@@       ",
             "        @@@@@@@@@       ",
             "        @@@   @@@       ",
             "        @@@   @@@       "], []),
    /* three-quarter, coming round to face us */
    toward: F(["            @@@@@@      ",
               "           @@@@@@@@     ",
               "    @@    @@@@@@@@@@    ",
               "     @@@@@@@@@@@@@@@    ",
               "      @@@@@@@@@@@@      ",
               "      @@@@@@@@@@@@      ",
               "      @@@     @@@       ",
               "      @@@     @@@       "], [[15, 2], [19, 2]], { front: true }),
    /* head on: the big domed head, both ears, both eyes */
    front: F(["        @@@@@@@@        ",
              "       @@@@@@@@@@       ",
              "      @@@@@@@@@@@@      ",
              "       @@@@@@@@@@       ",
              "        @@@@@@@@        ",
              "        @@@@@@@@        ",
              "        @@@  @@@        ",
              "        @@@  @@@        "], [[9, 2], [14, 2]], { front: true }),
  },
  /* the play bow: chest to the ground, rear in the air, tail up */
  bow: [
    F(["     @@                 ",
       "    @@@@@@@@@           ",
       "    @@@@@@@@@@          ",
       "    @@@@@@@@@@@@        ",
       "    @@@@@@@@@@@@@@  @@@@",
       "    @@@     @@@@@@@@@@@@",
       "    @@@       @@@@@@@@@@",
       "    @@@      @@@@ @@@@@ "], [[20, 6]]),
  ],
};
