create database f3;
create table posts(
    id int(10) unsigned primary key auto_increment not null,
    title varchar(500) default null,
    content varchar(10000) default null,
    date timestamp default current_timetamp not null
);