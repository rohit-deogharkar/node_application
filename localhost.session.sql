

-- create table logger_report(
--     callid int auto_increment primary key,
--     callstart varchar(255),
--     call_type varchar(255),
--     dispose_name varchar(255),
--     dispose_type varchar(255),
--     duration varchar(255),
--     agentname varchar(255),
--     campaign_name varchar(255),
--     process_name varchar(255),
--     leadset_id varchar(255),
--     reference_uuid varchar(255),
--     customer_uuid varchar(255),
--     hold varchar(255),
--     mute varchar(255),
--     ringing varchar(255),
--     transfer_time varchar(255),
--     conference varchar(255),
--     call_time varchar(255),
--     dispose_time varchar(255)
-- );


 select * , COUNT(*) from logger_report group by hour(callstart)