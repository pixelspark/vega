import {Bottom, Left, Top, Value, one, zero} from './constants';
import guideMark from './guide-mark';
import {lookup} from './guide-util';
import {RuleMark} from '../marks/marktypes';
import {AxisTickRole} from '../marks/roles';
import {addEncoders, encoder} from '../encode/encode-util';
import { isSignal } from '../../util';
import { ifTopOrLeftAxisExpr, xAxisConditionalEncoding } from './axis-util';

export default function(spec, config, userEncode, dataRef, size, band) {
  var _ = lookup(spec, config),
      orient = spec.orient,
      sign = isSignal(orient) ? ifTopOrLeftAxisExpr(orient.signal, -1, 1) : (orient === Left || orient === Top) ? -1 : 1,
      encode, enter, exit, update, tickSize, tickPos;

  encode = {
    enter: enter = {opacity: zero},
    update: update = {opacity: one},
    exit: exit = {opacity: zero}
  };

  addEncoders(encode, {
    stroke:           _('tickColor'),
    strokeCap:        _('tickCap'),
    strokeDash:       _('tickDash'),
    strokeDashOffset: _('tickDashOffset'),
    strokeOpacity:    _('tickOpacity'),
    strokeWidth:      _('tickWidth')
  });

  tickSize = encoder(size);
  tickSize.mult = sign;

  tickPos = {
    scale:  spec.scale,
    field:  Value,
    band:   band.band,
    extra:  band.extra,
    offset: band.offset,
    round:  _('tickRound')
  };

  if (!isSignal(orient)) {
    if (orient === Top || orient === Bottom) {
      update.y = enter.y = zero;
      update.y2 = enter.y2 = tickSize;
      update.x = enter.x = exit.x = tickPos;
    } else {
      update.x = enter.x = zero;
      update.x2 = enter.x2 = tickSize;
      update.y = enter.y = exit.y = tickPos;
    }
  } else {
    update.y = enter.y = xAxisConditionalEncoding(orient.signal, zero, tickPos);
    update.x = enter.x = xAxisConditionalEncoding(orient.signal, zero, tickPos, false);
    update.y2 = enter.y2 = xAxisConditionalEncoding(orient.signal, tickSize, null);
    update.x2 = enter.x2 = xAxisConditionalEncoding(orient.signal, tickSize, null, false);
    exit.x = xAxisConditionalEncoding(orient.signal, tickPos, null);
    exit.y = xAxisConditionalEncoding(orient.signal, tickPos, null, false);
  }



  return guideMark(RuleMark, AxisTickRole, null, Value, dataRef, encode, userEncode);
}
