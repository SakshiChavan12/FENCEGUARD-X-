import { getFenceStatus, getEvents, getSensorStatus, getEvent, searchEvents } from '../services/api';

// Test function to verify API integration
export const testAPI = async () => {
  console.log('=== Testing API Integration ===\n');

  try {
    // Test 1: Get all fence status
    console.log('📡 Testing getFenceStatus()...');
    const fenceResult = await getFenceStatus();
    if (fenceResult.success) {
      console.log('✅ getFenceStatus() success');
      console.log(`   Found ${fenceResult.data.length} sensors`);
      if (fenceResult.data.length > 0) {
        console.log('   First sensor:', fenceResult.data[0]);
      }
    } else {
      console.log('❌ getFenceStatus() failed:', fenceResult.message);
    }
    console.log('');

    // Test 2: Get events with pagination
    console.log('📡 Testing getEvents({ page: 1, limit: 20 })...');
    const eventsResult = await getEvents({ page: 1, limit: 20 });
    if (eventsResult.success) {
      console.log('✅ getEvents() success');
      console.log(`   Found ${eventsResult.data.length} events`);
      if (eventsResult.pagination) {
        console.log('   Pagination:', eventsResult.pagination);
      }
      if (eventsResult.data.length > 0) {
        console.log('   First event:', eventsResult.data[0]);
      }
    } else {
      console.log('❌ getEvents() failed:', eventsResult.message);
    }
    console.log('');

    // Test 3: Get individual sensor (if we have data)
    if (fenceResult.success && fenceResult.data.length > 0) {
      const sensorId = fenceResult.data[0].sensorId;
      console.log(`📡 Testing getSensorStatus('${sensorId}')...`);
      const sensorResult = await getSensorStatus(sensorId);
      if (sensorResult.success) {
        console.log('✅ getSensorStatus() success');
        console.log('   Sensor data:', sensorResult.data);
      } else {
        console.log('❌ getSensorStatus() failed:', sensorResult.message);
      }
      console.log('');
    }

    // Test 4: Get individual event (if we have data)
    if (eventsResult.success && eventsResult.data.length > 0) {
      const eventId = eventsResult.data[0]._id || eventsResult.data[0].id;
      if (eventId) {
        console.log(`📡 Testing getEvent('${eventId}')...`);
        const eventResult = await getEvent(eventId);
        if (eventResult.success) {
          console.log('✅ getEvent() success');
          console.log('   Event data:', eventResult.data);
        } else {
          console.log('❌ getEvent() failed:', eventResult.message);
        }
        console.log('');
      }
    }

    // Test 5: Search events
    console.log('📡 Testing searchEvents({ query: "alert", limit: 10 })...');
    const searchResult = await searchEvents({ query: 'alert', limit: 10 });
    if (searchResult.success) {
      console.log('✅ searchEvents() success');
      console.log(`   Found ${searchResult.data.length} matching events`);
    } else {
      console.log('❌ searchEvents() failed:', searchResult.message);
    }
    console.log('');

    console.log('=== API Test Complete ===');
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
};

// Auto-run if this file is executed directly
if (import.meta.env.DEV) {
  // Uncomment to run tests automatically in development
  // testAPI();
}