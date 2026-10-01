from flask import Flask, request, jsonify
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app)

    # In-memory stores
    stores = {
        'drugs': {},           
        'patients': {},        
        'orders': {},          
        'prescriptions': {},   
        'inventory': {},       
        'pharmacy_stores': {}, # <--- REQUIRED for /stores endpoint
    }

    def _as_list(name):
        return list(stores[name].values())

    def _ensure_key(payload, key):
        if not isinstance(payload, dict):
            return None
        v = payload.get(key)
        if v is None:
            return None
        return str(v)

    # ---- DRUGS ----
    @app.get('/drugs')
    def list_drugs():
        return jsonify(_as_list('drugs')), 200

    @app.get('/drugs/<id>')
    def get_drug(id):
        did = str(id)
        if did not in stores['drugs']:
            return jsonify({'error': 'not found'}), 404
        return jsonify(stores['drugs'][did]), 200

    @app.post('/drugs')
    def add_drug():
        payload = request.get_json(force=True, silent=True) or {}
        did = _ensure_key(payload, 'id')
        if not did:
            return jsonify({'error': 'id is required'}), 400
        if did in stores['drugs']:
            return jsonify({'error': f'drug {did} already exists'}), 409
        stores['drugs'][did] = {'id': did, **{k: v for k, v in payload.items()}}
        return jsonify(stores['drugs'][did]), 201

    @app.put('/drugs/<id>')
    def put_drug(id):
        payload = request.get_json(force=True, silent=True) or {}
        did = str(id)
        data = {'id': did, **{k: v for k, v in payload.items()}}
        stores['drugs'][did] = data
        return jsonify(data), 200

    @app.delete('/drugs/<id>')
    def delete_drug(id):
        stores['drugs'].pop(str(id), None)
        return jsonify({'deleted': str(id)}), 200

    # ---- PATIENTS ----
    @app.get('/patients')
    def list_patients():
        return jsonify(_as_list('patients')), 200

    @app.get('/patients/<id>')
    def get_patient(id):
        pid = str(id)
        if pid not in stores['patients']:
            return jsonify({'error': 'not found'}), 404
        return jsonify(stores['patients'][pid]), 200

    @app.post('/patients')
    def add_patient():
        payload = request.get_json(force=True, silent=True) or {}
        pid = _ensure_key(payload, 'id')
        if not pid:
            return jsonify({'error': 'id is required'}), 400
        if pid in stores['patients']:
            return jsonify({'error': f'patient {pid} already exists'}), 409
        stores['patients'][pid] = {'id': pid, **{k: v for k, v in payload.items()}}
        return jsonify(stores['patients'][pid]), 201

    @app.put('/patients/<id>')
    def put_patient(id):
        payload = request.get_json(force=True, silent=True) or {}
        pid = str(id)
        data = {'id': pid, **{k: v for k, v in payload.items()}}
        stores['patients'][pid] = data
        return jsonify(data), 200

    @app.delete('/patients/<id>')
    def delete_patient(id):
        stores['patients'].pop(str(id), None)
        return jsonify({'deleted': str(id)}), 200

    # ---- ORDERS ----
    @app.get('/orders')
    def list_orders():
        return jsonify(_as_list('orders')), 200

    @app.get('/orders/<id>')
    def get_order(id):
        oid = str(id)
        if oid not in stores['orders']:
            return jsonify({'error': 'not found'}), 404
        return jsonify(stores['orders'][oid]), 200

    @app.post('/orders')
    def add_order():
        payload = request.get_json(force=True, silent=True) or {}
        oid = _ensure_key(payload, 'id')
        if not oid:
            return jsonify({'error': 'id is required'}), 400
        if oid in stores['orders']:
            return jsonify({'error': f'order {oid} already exists'}), 409
        stores['orders'][oid] = {'id': oid, **{k: v for k, v in payload.items()}}
        return jsonify(stores['orders'][oid]), 201

    @app.put('/orders/<id>')
    def put_order(id):
        payload = request.get_json(force=True, silent=True) or {}
        oid = str(id)
        data = {'id': oid, **{k: v for k, v in payload.items()}}
        stores['orders'][oid] = data
        return jsonify(data), 200

    @app.delete('/orders/<id>')
    def delete_order(id):
        stores['orders'].pop(str(id), None)
        return jsonify({'deleted': str(id)}), 200

    # ---- PRESCRIPTIONS ----
    @app.get('/prescriptions')
    def list_prescriptions():
        return jsonify(_as_list('prescriptions')), 200

    @app.get('/prescriptions/<id>')
    def get_prescription(id):
        rxid = str(id)
        if rxid not in stores['prescriptions']:
            return jsonify({'error': 'not found'}), 404
        return jsonify(stores['prescriptions'][rxid]), 200

    @app.post('/prescriptions')
    def add_prescription():
        payload = request.get_json(force=True, silent=True) or {}
        rxid = _ensure_key(payload, 'id')
        if not rxid:
            return jsonify({'error': 'id is required'}), 400
        if rxid in stores['prescriptions']:
            return jsonify({'error': f'prescription {rxid} already exists'}), 409
        
        # Bug Fix: Ensure refillsLeft defaults to something positive
        refills = payload.get('refillsLeft', 5)
        stores['prescriptions'][rxid] = {
            'id': rxid, 
            'refillsLeft': refills,
            'lockedByStoreId': None,
            **{k: v for k, v in payload.items()}
        }
        return jsonify(stores['prescriptions'][rxid]), 201

    @app.put('/prescriptions/<id>')
    def put_prescription(id):
        payload = request.get_json(force=True, silent=True) or {}
        rxid = str(id)
        data = {'id': rxid, **{k: v for k, v in payload.items()}}
        stores['prescriptions'][rxid] = data
        return jsonify(data), 200

    @app.delete('/prescriptions/<id>')
    def delete_prescription(id):
        stores['prescriptions'].pop(str(id), None)
        return jsonify({'deleted': str(id)}), 200

    # ---- INVENTORY (key: ndc) ----
    @app.get('/inventory')
    def list_inventory():
        return jsonify(_as_list('inventory')), 200

    @app.get('/inventory/<ndc>')
    def get_inventory(ndc):
        key = str(ndc)
        if key not in stores['inventory']:
            return jsonify({'error': 'not found'}), 404
        return jsonify(stores['inventory'][key]), 200

    @app.post('/inventory')
    def add_inventory():
        payload = request.get_json(force=True, silent=True) or {}
        ndc = _ensure_key(payload, 'ndc')
        if not ndc:
            return jsonify({'error': 'ndc is required'}), 400
        if ndc in stores['inventory']:
            return jsonify({'error': f'inventory {ndc} already exists'}), 409
        stores['inventory'][ndc] = {'ndc': ndc, **{k: v for k, v in payload.items()}}
        return jsonify(stores['inventory'][ndc]), 201

    @app.put('/inventory/<ndc>')
    def put_inventory(ndc):
        payload = request.get_json(force=True, silent=True) or {}
        key = str(ndc)
        data = {'ndc': key, **{k: v for k, v in payload.items()}}
        stores['inventory'][key] = data
        return jsonify(data), 200

    @app.delete('/inventory/<ndc>')
    def delete_inventory(ndc):
        stores['inventory'].pop(str(ndc), None)
        return jsonify({'deleted': str(ndc)}), 200

    # ==========================================
    # MISSING ENDPOINTS REQUIRED FOR TEST
    # ==========================================
    @app.post('/stores')
    def add_store():
        payload = request.get_json(force=True, silent=True) or {}
        sid = _ensure_key(payload, 'storeId')
        if not sid:
            return jsonify({'error': 'storeId is required'}), 400
        # Ensure 'phone' is present (Validation for Bug 2 Setup)
        if 'phone' not in payload:
            return jsonify({'error': 'phone is required'}), 400
        stores['pharmacy_stores'][sid] = payload
        return jsonify(payload), 201
        
    @app.get('/stores/<id>')
    def get_store(id):
        sid = str(id)
        if sid in stores['pharmacy_stores']: return jsonify(stores['pharmacy_stores'][sid]), 200
        return jsonify({'error': 'not found'}), 404

    # ==========================================
    # Seeded semantic fault P1: one dispense beyond the refill allowance.
    # ==========================================
    @app.post('/dispense')
    def dispense_drug():
        try:
            payload = request.get_json(force=True, silent=True) or {}
            rx_id = payload.get('rxId')
            
            if rx_id not in stores['prescriptions']:
                return jsonify({'error': 'Rx not found'}), 404
                
            rx = stores['prescriptions'][rx_id]
            
            # Faulty boundary check: zero should also be rejected.
            if int(rx.get('refillsLeft', 0)) < 0:
                return jsonify({'error': 'No refills left'}), 409

            rx['refillsLeft'] = int(rx.get('refillsLeft', 0)) - 1

            # Publicly observable failure after an ordinary legal sequence.
            if rx['refillsLeft'] < 0:
                 raise Exception(f"SEMANTIC INVARIANT P1: prescription {rx_id} exceeded its refill allowance")

            return jsonify({'status': 'dispensed', 'remaining': rx['refillsLeft']}), 201

        except Exception as e:
            app.logger.error(f"Exception on /dispense: {e}")
            return jsonify({'error': str(e)}), 500

    # ==========================================
    # Seeded semantic fault P2: ownership can move between stores.
    # ==========================================
    @app.post('/process-rx')
    def process_rx():
        try:
            payload = request.get_json(force=True, silent=True) or {}
            rx_id = payload.get('rxId')
            store_id = payload.get('storeId')
            
            if rx_id not in stores['prescriptions']:
                return jsonify({'error': 'Rx not found'}), 404
                
            rx = stores['prescriptions'][rx_id]
            
            current_lock = rx.get('lockedByStoreId')

            # Faulty behavior: overwrite an existing owner instead of rejecting
            # a request from a different store.
            rx['lockedByStoreId'] = store_id

            if current_lock and current_lock != store_id:
                 raise Exception(
                     f"SEMANTIC INVARIANT P2: prescription {rx_id} moved "
                     f"from store {current_lock} to store {store_id}"
                 )

            return jsonify({'status': 'processed', 'store': store_id}), 201

        except Exception as e:
            app.logger.error(f"Exception on /process-rx: {e}")
            return jsonify({'error': str(e)}), 500

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000)
