#!/bin/bash
docker-compose up -d && printf "Waiting for MySQL server to start ...\n" && sleep 10 && printf "Creating tables ...\n" && while ! docker exec -it mysql_620098373 bash -c "mysql -uroot -proot < /tmp/init.sql"
do
	printf "The MySQL server seems to not have started yet\n"
	printf "Retrying ...\n"
	sleep 10
done
