#!/bin/sh


###################################################################
# THIS SCRIPT IS MEANT FOR LINUX SYSTEMS 
#
# BEFORE RUNNING THIS SCRIPT ENSURE THAT MYSQL AND MONGODB DATABASE 
# SERVERS ARE RUNNING
###################################################################

# Download and extract 
printf """

###########################################
DOWNLOADING AND EXTRACTING MYSQL SHELL TOOL
###########################################


""";
wget -O mysql_shell.tar.gz https://dev.mysql.com/get/Downloads/MySQL-Shell/mysql-shell-8.0.26-linux-glibc2.12-x86-64bit.tar.gz;
rm -r mysql_shell;
mkdir mysql_shell && tar zxvf mysql_shell.tar.gz -C ./mysql_shell;

printf """

#############################################
DOWNLOADING AND EXTRACTING MONGODB SHELL TOOL
#############################################


""";
wget -O mongodb_shell.tgz https://downloads.mongodb.com/compass/mongosh-1.0.7-linux-x64.tgz;
rm -r mongodb_shell;
mkdir mongodb_shell && tar zxvf mongodb_shell.tgz -C ./mongodb_shell;



mysql_cli="./mysql_shell/mysql-shell-8.0.26-linux-glibc2.12-x86-64bit/bin/mysqlsh";
mongodb_cli="./mongodb_shell/mongosh-1.0.7-linux-x64/bin/mongosh";




