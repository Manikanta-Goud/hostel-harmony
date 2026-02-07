import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { createClient } from '@supabase/supabase-js';

// ⚠️ IMPORTANT: REPLACE THE API KEY BELOW!
// 1. Go to: https://wjaeoziogvqrrdggekii.supabase.co
// 2. Click Settings → API
// 3. Copy the "anon public" key (starts with eyJ...)
// 4. Paste it below replacing 'PASTE_YOUR_KEY_HERE'
// 5. Fill in bulk-import-template.csv with your data
// 6. Run: node bulk-import.js

const SUPABASE_URL = 'https://wjaeoziogvqrrdggekii.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqYWVvemlvZ3ZxcnJkZ2dla2lpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MTU4MzcsImV4cCI6MjA4NTQ5MTgzN30.c_dyQlJ11xi3hu_3jd54NoqB5MTwtQnry-54coYtTmE'; // 👈 REPLACE THIS!

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function bulkImport() {
    try {
        // Read CSV file
        const csvContent = fs.readFileSync('./bulk-import-template.csv', 'utf-8');
        const records = parse(csvContent, {
            columns: true,
            skip_empty_lines: true,
            trim: true
        });

        console.log(`📊 Found ${records.length} students to import...`);

        let imported = 0;
        let errors = 0;

        for (const record of records) {
            try {
                // 1. Get or create hostel
                let { data: hostel } = await supabase
                    .from('hostels')
                    .select('id')
                    .eq('name', record.hostel_name)
                    .single();

                if (!hostel) {
                    const { data: newHostel, error } = await supabase
                        .from('hostels')
                        .insert([{
                            name: record.hostel_name,
                            address: 'Address for ' + record.hostel_name,
                            owner_id: 'bulk-import'
                        }])
                        .select()
                        .single();

                    if (error) throw error;
                    hostel = newHostel;
                    console.log(`✅ Created hostel: ${record.hostel_name}`);
                }

                // 2. Get or create floor
                let { data: floor } = await supabase
                    .from('floors')
                    .select('id')
                    .eq('hostel_id', hostel.id)
                    .eq('floor_number', parseInt(record.floor_number))
                    .single();

                if (!floor) {
                    const { data: newFloor, error } = await supabase
                        .from('floors')
                        .insert([{
                            hostel_id: hostel.id,
                            floor_number: parseInt(record.floor_number)
                        }])
                        .select()
                        .single();

                    if (error) throw error;
                    floor = newFloor;
                    console.log(`✅ Created floor: ${record.floor_number}`);
                }

                // 3. Get or create part/section (if specified)
                let parentRoomId = null;
                if (record.part_name) {
                    let { data: partRoom } = await supabase
                        .from('rooms')
                        .select('id')
                        .eq('floor_id', floor.id)
                        .eq('room_number', record.part_name)
                        .eq('room_type', 'section')
                        .single();

                    if (!partRoom) {
                        const { data: newPart, error } = await supabase
                            .from('rooms')
                            .insert([{
                                floor_id: floor.id,
                                room_number: record.part_name,
                                capacity: 100,
                                monthly_rent: 0,
                                room_type: 'section'
                            }])
                            .select()
                            .single();

                        if (error) throw error;
                        partRoom = newPart;
                        console.log(`✅ Created section: ${record.part_name}`);
                    }
                    parentRoomId = partRoom.id;
                }

                // 4. Get or create room
                let { data: room } = await supabase
                    .from('rooms')
                    .select('id')
                    .eq('floor_id', floor.id)
                    .eq('room_number', record.room_number)
                    .maybeSingle();

                if (!room) {
                    const memberCount = parseInt(record.member_count) || 1;
                    const { data: newRoom, error } = await supabase
                        .from('rooms')
                        .insert([{
                            floor_id: floor.id,
                            room_number: record.room_number,
                            capacity: memberCount,
                            monthly_rent: parseInt(record.monthly_rent),
                            room_type: 'room',
                            occupancy_type: memberCount > 1 ? 'family' : 'students',
                            parent_room_id: parentRoomId
                        }])
                        .select()
                        .single();

                    if (error) throw error;
                    room = newRoom;
                    console.log(`✅ Created room: ${record.room_number}`);
                }

                // 5. Add student
                const { error: studentError } = await supabase
                    .from('students')
                    .insert([{
                        room_id: room.id,
                        name: record.student_name,
                        phone: record.phone,
                        email: record.email || null,
                        aadhar_number: record.aadhar_number || null,
                        monthly_rent: parseInt(record.monthly_rent),
                        occupation: record.occupation || null,
                        permanent_address: record.permanent_address || null,
                        work_address: record.work_address || null,
                        father_name: record.father_name || null,
                        mother_name: record.mother_name || null,
                        parent_phone: record.parent_phone || null,
                        member_count: parseInt(record.member_count) || 1,
                        join_date: record.join_date || new Date().toISOString()
                    }]);

                if (studentError) throw studentError;

                imported++;
                console.log(`✅ Imported: ${record.student_name} -> Room ${record.room_number}`);

            } catch (err) {
                errors++;
                console.error(`❌ Error importing ${record.student_name}:`, err.message);
            }
        }

        console.log(`\n🎉 Import complete!`);
        console.log(`✅ Successfully imported: ${imported} students`);
        console.log(`❌ Errors: ${errors}`);

    } catch (error) {
        console.error('❌ Fatal error:', error);
    }
}

bulkImport();
