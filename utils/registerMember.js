const db = require("../data/database");

module.exports = async (member, name, class_role, section_role) => {
    const userRow = db.prepare("SELECT * FROM Users WHERE user_id = ?").get(member.id);

    console.log(userRow);

    if(userRow) return null;
        
    db.prepare("INSERT INTO Users (user_id, full_name) VALUES (?, ?)").run(member.id, name);

    const member_role = process.env.MEMBER_ROLE;

    await member.roles.add(member_role);
    const classRoles = member.roles.cache.filter(r => /^Classe\d{4}$/.test(r.name));
    for (const r of classRoles.values()) await member.roles.remove(r);
    const sectionRoles = member.roles.cache.filter(r => /^Sezione[A-Z]$/.test(r.name));
    for (const r of sectionRoles.values()) await member.roles.remove(r).catch(() => {});
    await member.roles.add(class_role);
    await member.roles.add(section_role);

    return true;
};