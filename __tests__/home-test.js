/**
 * @format
 * @lint-ignore-every XPLATJSCOPYRIGHT1
 */

import 'react-native';
import React from 'react';
import Boot from '../src/boot';
import Monitor from '../src/pages/monitor';
import Player_actions from '../src/store/player/actions';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';

it('renders correctly', () => {
  renderer.create(<Boot />);
});


