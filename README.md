# Hockey.js

An NHL discord hockey bot powered by discord.js and NHL.com

## Overview

This bot provides a discord interface for working with the official NHL.com api
and expands upon the base functionality. Its main goal is to provide daily schedule
announcements as well as assist in "watching" a game via message notifications 
for score updates and period ends.

Working with this bot is supposed to be incredibly easy. If any issues occur, please
don't hesitiate to initiate an issue ticket or a feature request.

Note: This project is completely open source and is a side project for the owner.
Please understand that updates may be slow to roll out. However, assistance is always
appreciated and it is asked to please follow the linting/code styling outlined 
in this readme when making adjustments. 

## Getting Started

### Adding this bot to your discord guild

### Configuring the bot for your needs
This bot is built with the intention that it can work in _any_ discord server. As such,
some information is needed in order for the bot to execute properly and perform its timed
tasks. Typing `!config` will show you something along the following:

So what needs to be set? 
1. Announcement Channel: Use `!channel` to set this. Ex: `!channel #hawkey`
    1. All commands, other than configuration commands, will fail without this
2. Role Permissions (optional): Use `!permission` to set this per role. 
    Ex: `!permission @editors configure`
    1. The level of permission must be set to one of the following:
    ```
    Configure: Allows a role to configure the bot as well as all other permissions
    Watch: Allows a role to select a game for "watching" as well as recieves interact permissions
    Interact: Allows a user to interact with the bot
    ```
3. Daily Schedule (optional): Use `!daily` to toggle daily schedule posts
    1. Adding a time (Ex: `!daily 8:00`) will set the time of the daily schedule post.
    Note: all times are based on a 24 hour clock and are EST based.
    2. Schedules are only sent once a day. So toggling updates on and off will not send multiple
    schedules. However, if you toggle the scheduler on, the system will recognize the change 
    within 15 minutes of it happening, and will send a schedule within 15 minutes. 

### Additional info
This bot is built under the condition that the schedule for the NHL does not change. If a change
to the schedule occurs, the bot *will not* recognize it. The only way this *could* happen is if 
no schedules have been sent for the day and the schedule change occurs. However, this is highly
unlikely given the default schedule post of 7 AM EST. The developers may be able to look into 
how to make adjustments, but this is a low priority feature.

## Development
This bot is considered to be in *beta* versioning. The following features must be completed 
before an official V1 release will occur. This means that there will most likely be bugs, 
changing options, and potentially unclear information on execution until the v1 release occurs.
The V1 features are as follows:
[x] Completion of base configuration and role permissions
[x] Completion of daily schedule postings and daily toggle controls
[] Completion of an automated deployment track
[] Completion of the 'watch' feature, allowing text-based messaging for game updates
[] Completion of the following query functionalities:
    [] League standings
    [] Team information
    [] Player information
    [] Player leaderboards, including top goal scores, top assists, top saves, top hits
    [] Player leaderboards on a weekly basis

### Local Development 

### Linting

### Adding a Pull Request
