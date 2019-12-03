# Movie Visualization Project for SI 539

## Introduction

This is a web-based interactive visualization system for Chinese movie data. There are four main views and users can click, select, hover on the elements and see interactions among all those views.

## Views

#### Scatter Plot

It shows the distribution of the movie data over box office and rating. Each circle represents an individual movie. The color represents the category and the size shows how many award the movie has won.

By hovering over the circle, additional information about the movie will shows up and the circle is highlighted with a black border. Besides hovering, users can also draw a selection box to highlight a specific cluster of circle or click on a circle to explore more about the director and the cast.

#### Stacked Histogram

It shows the movie distribution over time. The x-axis is the launch year and the y-axis is the total number of film. The color stands for the type and it is consistent with the scatter plot.

By holding down and dragging the mouse, users can draw a selection box on the x-axis in order to select a certain time period. The selected columns will be highlighted and the corresponding circles will also be highlighted in the scatter plot view. By moving the selection box, users can explore how the box office and rating distribution changes with the launching year.

#### Collapsible Force Layout

It shows more detailed information about a single movie. The one on the left shows the director of the film and what other films he/she has directed. With each movie node, it connects with its casts. By clicking on the father node, the graph can be collapsed or expanded. 

#### Small Multiples

Each small graph represents a single actor/actress and all directors that he/she works with. The size of the actor node is calculated by the average rating of all the films that he/she is in. By clicking on a specific actor or director node, all the films that he/she is in will be highlighted in the scatter plot view so that users can explore patterns of this acter/director.

## What I Learned

I had fun using the D3 library and combining data with diagrams. The most challenging part is to build interactions among all these views and help users to find useful patterns within the dataset.
