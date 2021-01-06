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

### Additional info

## Development

### Local Development 

### Linting

### Adding a Pull Request
