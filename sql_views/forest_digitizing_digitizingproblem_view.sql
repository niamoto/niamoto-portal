SELECT p.id
    p.uuid,
    p.location,
    p.created,
    p.modified,
    p.problem,
    p.comments,
    u.username,
    CONCAT(u.first_name, ' ', u.last_name) AS creator_name,
    p.massif_id
FROM forest_digitizing_digitizingproblem AS p
LEFT JOIN auth_user AS u
ON p.created_by_id = u.id
